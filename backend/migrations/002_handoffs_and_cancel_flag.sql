-- Add cancellation scheduling flag to profiles and
-- create one-time session handoff storage for landing -> builder redirects.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

-- Recreate safe profile update policy to protect new billing column.
DROP POLICY IF EXISTS "Users can update own safe fields" ON public.profiles;
CREATE POLICY "Users can update own safe fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND subscription_tier IS NOT DISTINCT FROM (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid())
    AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.profiles WHERE id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.profiles WHERE id = auth.uid())
    AND builds_used_this_period IS NOT DISTINCT FROM (SELECT builds_used_this_period FROM public.profiles WHERE id = auth.uid())
    AND build_period_start IS NOT DISTINCT FROM (SELECT build_period_start FROM public.profiles WHERE id = auth.uid())
    AND current_period_start IS NOT DISTINCT FROM (SELECT current_period_start FROM public.profiles WHERE id = auth.uid())
    AND current_period_end IS NOT DISTINCT FROM (SELECT current_period_end FROM public.profiles WHERE id = auth.uid())
    AND cancel_at_period_end IS NOT DISTINCT FROM (SELECT cancel_at_period_end FROM public.profiles WHERE id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.session_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  payload_encrypted TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_handoffs_expires_at
  ON public.session_handoffs(expires_at);
CREATE INDEX IF NOT EXISTS idx_session_handoffs_consumed_at
  ON public.session_handoffs(consumed_at);

ALTER TABLE public.session_handoffs ENABLE ROW LEVEL SECURITY;

-- No direct client access. APIs use service role.
DROP POLICY IF EXISTS "Deny direct access to session handoffs" ON public.session_handoffs;
CREATE POLICY "Deny direct access to session handoffs"
  ON public.session_handoffs FOR ALL
  USING (false)
  WITH CHECK (false);

REVOKE ALL ON public.session_handoffs FROM anon, authenticated;

-- Cleanup helper (schedule externally via cron or Supabase scheduled job).
CREATE OR REPLACE FUNCTION public.cleanup_expired_session_handoffs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.session_handoffs
  WHERE expires_at < now()
     OR (consumed_at IS NOT NULL AND consumed_at < now() - interval '1 day');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
