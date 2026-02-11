-- ============================================================
-- MC Plugin Builder — Initial Supabase Schema
-- Run this in the Supabase SQL Editor (or via psql).
-- ============================================================
--
-- This migration creates all tables, RLS policies, triggers,
-- RPC functions, and storage buckets required by the app.
-- It is idempotent: every statement uses IF NOT EXISTS or
-- CREATE OR REPLACE so it can be re-run safely.
-- ============================================================


-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN (
      'active', 'past_due', 'canceled', 'trialing',
      'incomplete', 'incomplete_expired', 'unpaid', 'paused'
    )),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  builds_used_this_period INTEGER NOT NULL DEFAULT 0,
  build_period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can SELECT own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- RLS: Users can UPDATE only safe columns (display_name).
-- Protected billing/tier columns are blocked via NULL-safe comparisons.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own safe fields'
  ) THEN
    CREATE POLICY "Users can update own safe fields"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (
        subscription_tier IS NOT DISTINCT FROM (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid())
        AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
        AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.profiles WHERE id = auth.uid())
        AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.profiles WHERE id = auth.uid())
        AND builds_used_this_period IS NOT DISTINCT FROM (SELECT builds_used_this_period FROM public.profiles WHERE id = auth.uid())
        AND build_period_start IS NOT DISTINCT FROM (SELECT build_period_start FROM public.profiles WHERE id = auth.uid())
        AND current_period_start IS NOT DISTINCT FROM (SELECT current_period_start FROM public.profiles WHERE id = auth.uid())
        AND current_period_end IS NOT DISTINCT FROM (SELECT current_period_end FROM public.profiles WHERE id = auth.uid())
      );
  END IF;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  config_size_bytes INTEGER GENERATED ALWAYS AS (octet_length(config::text)) STORED,
  version INTEGER NOT NULL DEFAULT 1,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Max config size 500KB
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'config_max_size'
  ) THEN
    ALTER TABLE public.projects ADD CONSTRAINT config_max_size
      CHECK (octet_length(config::text) <= 512000);
  END IF;
END $$;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can manage own projects'
  ) THEN
    CREATE POLICY "Users can manage own projects"
      ON public.projects FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- DB-enforced free tier project limit (insert)
CREATE OR REPLACE FUNCTION public.enforce_project_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  active_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));

  SELECT subscription_tier INTO user_tier
  FROM public.profiles WHERE id = NEW.user_id;

  IF user_tier = 'free' THEN
    SELECT count(*) INTO active_count
    FROM public.projects
    WHERE user_id = NEW.user_id AND NOT is_archived
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF active_count >= 1 THEN
      RAISE EXCEPTION 'Free tier limited to 1 active project. Upgrade to Premium for unlimited projects.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_project_limit_on_insert ON public.projects;
CREATE TRIGGER enforce_project_limit_on_insert
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_limit();

-- DB-enforced free tier project limit (unarchive)
CREATE OR REPLACE FUNCTION public.enforce_project_limit_on_unarchive()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  active_count INTEGER;
BEGIN
  IF OLD.is_archived = true AND NEW.is_archived = false THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));

    SELECT subscription_tier INTO user_tier
    FROM public.profiles WHERE id = NEW.user_id;

    IF user_tier = 'free' THEN
      SELECT count(*) INTO active_count
      FROM public.projects
      WHERE user_id = NEW.user_id AND NOT is_archived AND id != NEW.id;

      IF active_count >= 1 THEN
        RAISE EXCEPTION 'Free tier limited to 1 active project. Upgrade to Premium for unlimited projects.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_project_limit_on_unarchive ON public.projects;
CREATE TRIGGER enforce_project_limit_on_unarchive
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_limit_on_unarchive();

CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects (user_id, is_archived);


-- ============================================================
-- 3. BUILD LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.build_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  download_id TEXT,
  plugin_name TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  action_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'build_logs' AND policyname = 'Users can view own builds'
  ) THEN
    CREATE POLICY "Users can view own builds"
      ON public.build_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_build_logs_download ON public.build_logs (download_id);
CREATE INDEX IF NOT EXISTS idx_build_logs_user_month ON public.build_logs (user_id, created_at);


-- ============================================================
-- 4. WEBHOOK EVENTS (Stripe idempotency)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies = no client access (service role only)

CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.webhook_events (event_type, processed_at);


-- ============================================================
-- 5. BUILD JOBS (async build queue)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.build_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  plugin_config JSONB NOT NULL,
  plugin_name TEXT NOT NULL DEFAULT 'Untitled',
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  worker_id TEXT,
  build_dir TEXT,
  error_message TEXT,
  jar_filename TEXT,
  artifact_storage_path TEXT,
  artifact_size_bytes BIGINT,
  artifact_expires_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.build_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own build jobs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'build_jobs' AND policyname = 'Users can view own build jobs'
  ) THEN
    CREATE POLICY "Users can view own build jobs"
      ON public.build_jobs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_build_jobs_status ON public.build_jobs (status, created_at);
CREATE INDEX IF NOT EXISTS idx_build_jobs_user ON public.build_jobs (user_id);


-- ============================================================
-- 6. RPC FUNCTIONS
-- ============================================================

-- Atomically increment build count. Returns TRUE if allowed, FALSE if limit reached.
CREATE OR REPLACE FUNCTION increment_build_count(
  p_user_id UUID,
  p_max_builds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
  user_period_end TIMESTAMPTZ;
  user_period_start TIMESTAMPTZ;
BEGIN
  SELECT current_period_end, build_period_start
  INTO user_period_end, user_period_start
  FROM public.profiles WHERE id = p_user_id;

  -- Reset counter if billing period has ended
  IF user_period_end IS NOT NULL AND user_period_end < now() THEN
    UPDATE public.profiles
    SET builds_used_this_period = 0
    WHERE id = p_user_id;
  ELSIF user_period_end IS NULL THEN
    -- Free user: reset on calendar month boundary
    IF user_period_start < date_trunc('month', now()) THEN
      UPDATE public.profiles
      SET builds_used_this_period = 0,
          build_period_start = date_trunc('month', now())
      WHERE id = p_user_id;
    END IF;
  END IF;

  -- Atomic increment with limit check
  UPDATE public.profiles
  SET builds_used_this_period = builds_used_this_period + 1,
      updated_at = now()
  WHERE id = p_user_id
    AND builds_used_this_period < p_max_builds
  RETURNING builds_used_this_period INTO updated_count;

  RETURN updated_count IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Roll back a build count on failure (charge-on-success policy).
CREATE OR REPLACE FUNCTION decrement_build_count(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET builds_used_this_period = GREATEST(builds_used_this_period - 1, 0),
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically enqueue a build job, enforcing per-user queue limit.
CREATE OR REPLACE FUNCTION enqueue_build_job(
  p_user_id UUID,
  p_plugin_config JSONB,
  p_plugin_name TEXT
) RETURNS UUID AS $$
DECLARE
  queued_count INTEGER;
  max_queued INTEGER := 5;  -- Default, overridable per tier if needed
  new_id UUID;
BEGIN
  SELECT count(*) INTO queued_count
  FROM public.build_jobs
  WHERE user_id = p_user_id AND status IN ('queued', 'running');

  IF queued_count >= max_queued THEN
    RAISE EXCEPTION 'Queue limit exceeded: you have % jobs in progress', queued_count;
  END IF;

  INSERT INTO public.build_jobs (user_id, plugin_config, plugin_name)
  VALUES (p_user_id, p_plugin_config, p_plugin_name)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically claim the next queued build job for a worker.
CREATE OR REPLACE FUNCTION claim_next_build_job(
  p_worker_id TEXT
) RETURNS UUID AS $$
DECLARE
  claimed_id UUID;
BEGIN
  UPDATE public.build_jobs
  SET status = 'running',
      worker_id = p_worker_id,
      heartbeat_at = now(),
      updated_at = now()
  WHERE id = (
    SELECT id FROM public.build_jobs
    WHERE status = 'queued'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id INTO claimed_id;

  RETURN claimed_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recover stuck build jobs (no heartbeat within timeout).
CREATE OR REPLACE FUNCTION recover_stuck_build_jobs(
  p_timeout_minutes INTEGER DEFAULT 10
) RETURNS INTEGER AS $$
DECLARE
  recovered INTEGER;
BEGIN
  UPDATE public.build_jobs
  SET status = 'queued',
      worker_id = NULL,
      heartbeat_at = NULL,
      updated_at = now()
  WHERE status = 'running'
    AND heartbeat_at < now() - (p_timeout_minutes || ' minutes')::interval;

  GET DIAGNOSTICS recovered = ROW_COUNT;
  RETURN recovered;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 7. SUPABASE STORAGE BUCKET
-- ============================================================
-- Create the build-artifacts bucket (public = false for signed URLs).
-- Supabase storage.buckets is only writable by service role.
INSERT INTO storage.buckets (id, name, public)
VALUES ('build-artifacts', 'build-artifacts', false)
ON CONFLICT (id) DO NOTHING;
