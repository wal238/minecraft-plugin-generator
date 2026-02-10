# Landing Page + Auth + Stripe Billing — Implementation Plan

## Context

The Minecraft Plugin Builder currently has no landing page, auth, billing, or user management. The frontend is a single-page Vite React app at `frontend/` and the backend is a stateless FastAPI server at `backend/`. This plan creates a new Next.js app at `landing/` with full SEO, user authentication (Supabase), and Stripe subscription billing to support three pricing tiers (Free, Premium $4.99/mo, Pro $9.99/mo).

**Key problems this solves:**
- No way to monetize the product
- No user accounts or data persistence (projects are lost on refresh)
- No SEO — the builder SPA is invisible to search engines
- All backend routes are completely open with no auth or rate limiting

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Landing framework** | Next.js 14+ App Router (TypeScript) | SSR/SSG for SEO, API routes for webhooks |
| **Auth provider** | Supabase Auth | Includes Postgres DB, JWT-based (works cross-app), Python SDK for backend |
| **Database** | Supabase Postgres (shared) | Single DB for landing, builder, and backend. RLS for security. |
| **Data access** | Hybrid: Supabase direct (reads) + FastAPI (writes/builds) | See security model below |
| **Payments** | Stripe Checkout + Customer Portal | Industry standard, handles PCI compliance |
| **Styling** | Tailwind CSS + CSS variables | Fast development, responsive, pairs well with Next.js |
| **Pixel font** | `Press Start 2P` (Google Fonts) | Free Minecraft-style alternative |
| **Cross-app auth** | Shared cookie domain SSO (`.mcpluginbuilder.com`) | No token-in-URL. Secure, standard approach for same-parent-domain apps. |
| **Usage reset cycle** | Stripe billing period | Resets align with when user is charged. `current_period_start`/`end` from Stripe. |
| **Payment failure handling** | Keep access until period ends | User paid for current cycle. Downgrade only on `customer.subscription.deleted` at period end. |

---

## Shared Database & Security Model

**One Supabase project** serves all three parts of the system:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│  Landing (Next)  │     │  Builder (Vite)  │     │  Backend (FastAPI)   │
│                  │     │                  │     │                      │
│  Supabase JS     │     │  Supabase JS     │     │  supabase-py +       │
│  (anon key)      │     │  (anon key)      │     │  service role key    │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────────┘
         │                        │                         │
         │    READ (RLS enforced) │    READ (RLS enforced)  │  READ/WRITE (service role)
         └────────────┬───────────┘                         │
                      │                                     │
              ┌───────▼─────────────────────────────────────▼───┐
              │              Supabase Postgres                   │
              │  profiles | projects | build_logs                │
              │  webhook_events (idempotency)                    │
              │              Row Level Security ON               │
              └─────────────────────────────────────────────────┘
```

**Security principles:**

1. **Browser clients (landing + builder)** use the Supabase **anon key** — can only access data permitted by RLS. Users can only read/write their own rows.

2. **FastAPI backend** uses the Supabase **service role key** (server-side only). Bypasses RLS for privileged operations: incrementing build counts, logging builds, updating subscription tiers.

3. **Writes that affect billing/limits go through FastAPI only** — the backend is the single authority for build generation, quota enforcement, and subscription tier changes.

4. **Reads go directly to Supabase** — profile, projects, build history read via JS client with RLS.

5. **Profiles table is split into safe vs protected columns** — RLS UPDATE policy restricts which columns clients can modify (see Phase 2).

**What each app can do:**

| Operation | Landing (Next.js) | Builder (Vite) | Backend (FastAPI) |
|-----------|-------------------|----------------|-------------------|
| Read own profile | Direct (Supabase RLS) | Direct (Supabase RLS) | Service role |
| Update display_name | Direct (Supabase RLS) | Direct (Supabase RLS) | — |
| Read own projects | Direct (Supabase RLS) | Direct (Supabase RLS) | Service role |
| Save/update project | Direct (Supabase RLS) | Direct (Supabase RLS) | — |
| Delete project | Direct (Supabase RLS) | Direct (Supabase RLS) | — |
| Generate plugin (build) | — | Via FastAPI API | Enforces limits, increments count |
| Preview code | — | Via FastAPI API | Enforces tier event/action limits |
| Update subscription tier | — | — | Only via Stripe webhook (service role) |
| Increment build count | — | — | Atomic Postgres update (service role) |

**Existing backend routes — auth changes:**

Currently **all backend routes are open**. After this change:

| Route | Auth Required | Tier Check | Rate Limit |
|-------|--------------|------------|------------|
| `POST /api/generate-plugin` | Yes | Build quota + event/action limits | 10/min/user |
| `POST /api/preview-code` | Yes | Event/action limits only | 30/min/user |
| `GET /api/blocks` | No (public) | — | 60/min/IP |
| `GET /api/worlds` | No (public) | — | 60/min/IP |
| `GET /api/download/{id}` | Yes | Must own the build (verify via `build_logs.download_id`) | 20/min/user |
| `GET /health` | No (public) | — | — |

---

## Phase 1: Next.js Project Setup

### Step 1: Scaffold the app
```bash
npx create-next-app@latest landing --typescript --tailwind --eslint --app --src-dir
```

### Step 2: Install dependencies
```bash
cd landing
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
```

### Step 3: Directory structure
```
landing/
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── src/
│   ├── middleware.ts                    # Supabase session refresh
│   ├── app/
│   │   ├── layout.tsx                  # Root: fonts, metadata, providers
│   │   ├── page.tsx                    # Landing homepage (all sections)
│   │   ├── globals.css                 # CSS vars, Minecraft design tokens
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── callback/route.ts       # Supabase OAuth callback
│   │   │   └── reset-password/page.tsx
│   │   ├── account/
│   │   │   ├── layout.tsx              # Auth-protected wrapper
│   │   │   ├── page.tsx                # Dashboard: plan, usage, "Go to Builder"
│   │   │   └── billing/page.tsx        # Stripe Customer Portal redirect
│   │   └── api/
│   │       ├── webhooks/stripe/route.ts
│   │       ├── create-checkout/route.ts
│   │       └── create-portal/route.ts
│   ├── components/
│   │   ├── landing/                    # Hero, FeaturesGrid, PricingCards,
│   │   │                               # FeatureComparisonTable, HowItWorks,
│   │   │                               # FAQ, FinalCTA, Footer, Navbar
│   │   ├── ui/                         # MinecraftButton, MinecraftCard,
│   │   │                               # BlockShape, Accordion, PricingToggle,
│   │   │                               # AnimatedSection
│   │   └── auth/                       # AuthForm, ProtectedRoute, UserMenu
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   └── server.ts              # Server-side client (API routes)
│   │   └── stripe/
│   │       ├── client.ts              # Stripe SDK init
│   │       └── plans.ts               # Tier definitions + limits
│   ├── hooks/
│   │   ├── useUser.ts
│   │   └── useSubscription.ts
│   └── types/
│       └── index.ts
```

---

## Phase 2: Database Schema (Supabase Postgres)

Run in Supabase SQL editor:

```sql
-- ============================================================
-- PROFILES: User data with protected billing columns
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- User-editable fields
  email TEXT NOT NULL,
  display_name TEXT,
  -- Protected fields (only writable by service role / triggers)
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
  build_period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),  -- Free-tier period tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Users can SELECT own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

-- RLS: Users can UPDATE only safe columns (display_name)
-- Billing/tier/usage columns are BLOCKED from client updates.
-- Uses IS NOT DISTINCT FROM instead of = for NULL-safe comparison
-- (= with NULL yields NULL which is treated as false, blocking legitimate updates
-- to display_name when nullable billing columns are still NULL for free users).
CREATE POLICY "Users can update own safe fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Ensure protected columns haven't changed (NULL-safe comparisons)
    subscription_tier IS NOT DISTINCT FROM (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid())
    AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.profiles WHERE id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.profiles WHERE id = auth.uid())
    AND builds_used_this_period IS NOT DISTINCT FROM (SELECT builds_used_this_period FROM public.profiles WHERE id = auth.uid())
    AND build_period_start IS NOT DISTINCT FROM (SELECT build_period_start FROM public.profiles WHERE id = auth.uid())
    AND current_period_start IS NOT DISTINCT FROM (SELECT current_period_start FROM public.profiles WHERE id = auth.uid())
    AND current_period_end IS NOT DISTINCT FROM (SELECT current_period_end FROM public.profiles WHERE id = auth.uid())
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PROJECTS: Saved plugin configs with DB-enforced free tier limit
-- ============================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  config_size_bytes INTEGER GENERATED ALWAYS AS (octet_length(config::text)) STORED,
  version INTEGER NOT NULL DEFAULT 1,          -- Optimistic concurrency control
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce max config size (500KB) via constraint
ALTER TABLE public.projects ADD CONSTRAINT config_max_size
  CHECK (octet_length(config::text) <= 512000);

-- DB-enforced free tier project limit (not bypassable by client).
-- Uses pg_advisory_xact_lock to prevent concurrent inserts from both passing the count check.
-- The lock is per-user (hash of user_id) and auto-releases at transaction end.
CREATE OR REPLACE FUNCTION public.enforce_project_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  active_count INTEGER;
BEGIN
  -- Advisory lock scoped to this user — serializes concurrent inserts for same user
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));

  SELECT subscription_tier INTO user_tier
  FROM public.profiles WHERE id = NEW.user_id;

  IF user_tier = 'free' THEN
    SELECT count(*) INTO active_count
    FROM public.projects
    WHERE user_id = NEW.user_id AND NOT is_archived AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF active_count >= 1 THEN
      RAISE EXCEPTION 'Free tier limited to 1 active project. Upgrade to Premium for unlimited projects.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_project_limit_on_insert
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_limit();

-- Also enforce on UPDATE when is_archived changes from true → false (unarchive).
-- Same advisory lock pattern to prevent concurrent unarchive race.
CREATE OR REPLACE FUNCTION public.enforce_project_limit_on_unarchive()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  active_count INTEGER;
BEGIN
  -- Only check when is_archived changes from true to false
  IF OLD.is_archived = true AND NEW.is_archived = false THEN
    -- Advisory lock scoped to this user
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

CREATE TRIGGER enforce_project_limit_on_unarchive
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_limit_on_unarchive();

-- ============================================================
-- BUILD LOGS: Audit trail
-- ============================================================
CREATE TABLE public.build_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  download_id TEXT,                    -- Links to generated JAR file for ownership verification
  plugin_name TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  action_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_build_logs_download ON public.build_logs (download_id);

-- ============================================================
-- WEBHOOK EVENTS: Idempotency tracking for Stripe webhooks
-- ============================================================
CREATE TABLE public.webhook_events (
  event_id TEXT PRIMARY KEY,           -- Stripe event.id
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- Tracks last status change (used for stale-pending detection)
  processed_at TIMESTAMPTZ                    -- Set when status → 'processed'
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- build_logs: read-only for users (inserts via service role only)
CREATE POLICY "Users can view own builds"
  ON public.build_logs FOR SELECT USING (auth.uid() = user_id);

-- projects: full CRUD for own projects
CREATE POLICY "Users can manage own projects"
  ON public.projects FOR ALL USING (auth.uid() = user_id);

-- webhook_events: no client access (service role only)
-- No policies = no access via anon key

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_build_logs_user_month ON public.build_logs (user_id, created_at);
CREATE INDEX idx_projects_user ON public.projects (user_id, is_archived);
CREATE INDEX idx_webhook_events_type ON public.webhook_events (event_type, processed_at);
```

---

## Phase 3: Landing Page UI

Build all sections for `landing/src/app/page.tsx`:

1. **Navbar** — Sticky, transparent→solid on scroll. Logo + nav links (Features, Pricing, How It Works, FAQ). Login/Signup buttons or UserMenu.
2. **Hero** — Full viewport, dark gradient background. `Press Start 2P` title. CSS-animated colored blocks (orange=Events, blue=Conditions, green=Actions, red=Generate). Two CTAs: [START FREE] → `/signup`, [WATCH DEMO] → scroll.
3. **Features Grid** — 3x2 grid. Each card: CSS block icon, title, description. Hover: lift + shadow.
4. **Pricing Cards** — Monthly/yearly toggle. 3 cards (Orange=Free, Green=Premium highlighted, Gold=Pro). Feature checklists. CTA buttons trigger Stripe Checkout (or signup for free).
5. **Feature Comparison Table** — Responsive table with all tier differences.
6. **How It Works** — 4-step horizontal flow (vertical on mobile). Connected by dotted lines.
7. **FAQ** — Accordion with ~8 questions.
8. **Final CTA** — Dark section, "Ready to Build?" + START FREE button.
9. **Footer** — 4-column links layout.

### Design System (in `globals.css`)
- **Colors**: Orange `#FF6B35`, Green `#4CAF50`, Blue `#2196F3`, Red `#F44336`, Yellow `#FFC107`, Purple `#9C27B0`, Gray `#757575` + dark variants for 3D shadows
- **Fonts**: `Press Start 2P` for headers, system sans-serif for body
- **Buttons**: No border-radius (blocky). `box-shadow` for 3D depth. Hover: scale(1.02) + bigger shadow. Click: translate(2px,2px) + smaller shadow (pressed).
- **Animations**: `IntersectionObserver`-based scroll reveal (fade-in + slide-up). No external animation library.

---

## Phase 4: Authentication (Supabase)

### Auth pages
- **`/signup`** and **`/login`** — Shared `AuthForm` component with email + password fields
- **`/callback`** — Route handler for Supabase OAuth callback
- **`/reset-password`** — Password reset flow

### Auth state
- `useUser()` hook — wraps `supabase.auth.getUser()`, returns user + loading state
- `useSubscription()` hook — queries `profiles` table for tier + usage
- `middleware.ts` — refreshes Supabase session on every request

### Cross-app auth (shared cookie domain SSO)

**No token-in-URL.** Both apps share a parent domain:
- Landing: `mcpluginbuilder.com` (Next.js)
- Builder: `app.mcpluginbuilder.com` (Vite SPA)

Both apps configure the Supabase client with the same cookie domain:
```typescript
createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  cookieOptions: { domain: '.mcpluginbuilder.com', sameSite: 'lax', secure: true }
})
```

**Flow:**
1. User logs in on `mcpluginbuilder.com` — Supabase sets auth cookie on `.mcpluginbuilder.com`
2. User clicks "Go to Builder" → navigates to `app.mcpluginbuilder.com`
3. Builder's Supabase client reads the same cookie → user is already authenticated
4. No tokens in URLs, no PKCE exchange needed

**Local development:** Both apps on `localhost` (different ports). Cookies set without an explicit `domain` attribute default to the exact host (host-only cookie), and `localhost` cookies are shared across ports by the browser spec. So for local dev, simply **omit the `domain` option** (do not set `domain: 'localhost'` — browser handling of explicit localhost domains is unreliable across browsers). The Supabase client will use localStorage-based sessions by default on localhost, which is per-origin. For local cross-port auth testing, configure Supabase to use cookies with **no explicit domain**:
```typescript
// Local dev only — omit domain so browser uses host-only cookie for localhost
createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  cookieOptions: { sameSite: 'lax', secure: false }  // no domain key
})
```

### Account page (`/account`)
- Shows current plan, builds used / limit, subscription status
- "Manage Subscription" → Stripe Customer Portal
- "Go to Builder" → simple link to `app.mcpluginbuilder.com`

---

## Phase 5: Stripe Integration

### Stripe Dashboard setup
Create 4 Price objects:
- `price_premium_monthly` — $4.99/mo recurring
- `price_premium_yearly` — $49.99/yr recurring
- `price_pro_monthly` — $9.99/mo recurring
- `price_pro_yearly` — $99.99/yr recurring

Configure Stripe Smart Retries for failed payments (default: up to 4 retries over ~3 weeks).

### Plans config (`landing/src/lib/stripe/plans.ts`)

Centralized tier definitions with limits + server-side price ID allowlist:

```typescript
export const PLANS = {
  free: {
    name: 'Freemium',
    limits: { plugins: 1, buildsPerPeriod: 1, maxEvents: 4, maxActions: 8,
              watermark: true, apiAccess: false, teamMembers: 0 },
    stripePriceIds: [],  // no checkout for free
  },
  premium: {
    name: 'Premium',
    limits: { plugins: -1, buildsPerPeriod: 5, maxEvents: 20, maxActions: 50,
              watermark: false, apiAccess: false, teamMembers: 0 },
    stripePriceIds: ['price_premium_monthly', 'price_premium_yearly'],
  },
  pro: {
    name: 'Pro',
    limits: { plugins: -1, buildsPerPeriod: 20, maxEvents: -1, maxActions: -1,
              watermark: false, apiAccess: true, teamMembers: 5 },
    stripePriceIds: ['price_pro_monthly', 'price_pro_yearly'],
  },
} as const;

// Server-side allowlist of valid price IDs (prevents client sending arbitrary prices)
export const VALID_PRICE_IDS = new Set(
  Object.values(PLANS).flatMap(p => p.stripePriceIds)
);
```

### API routes

**CSRF protection for cookie-based auth routes:**
Because auth is cookie-based (shared domain SSO), all state-changing POST routes must verify the request origin to prevent cross-site request forgery. Both `/api/create-checkout` and `/api/create-portal` validate the `Origin` header:
```typescript
// lib/csrf.ts — shared CSRF origin check
const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL,           // e.g. https://mcpluginbuilder.com
  process.env.NEXT_PUBLIC_BUILDER_URL,        // e.g. https://app.mcpluginbuilder.com
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : []),
]);

export function validateOrigin(req: Request): Response | null {
  const origin = req.headers.get('origin');

  // Primary check: Origin header (set by browsers on all cross-origin AND same-origin POST requests)
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return null;  // Origin is valid
  }

  // Fallback: Sec-Fetch-Site header (set by modern browsers, cannot be spoofed by JS).
  // Accepts 'same-origin' and 'same-site' — both indicate the request came from our domain.
  // This covers the rare case where a proxy strips Origin but preserves Sec-Fetch-*.
  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return null;  // Sec-Fetch-Site confirms same-origin/same-site
  }

  // Neither Origin nor Sec-Fetch-Site validated — reject
  return new Response('Forbidden: invalid origin', { status: 403 });
}
```

**Idempotency helpers for duplicate-click prevention:**

Both `/api/create-checkout` and `/api/create-portal` require an `Idempotency-Key` header (client-generated UUID per button click). This prevents double session creation from rapid clicks or network retries.

```typescript
// lib/idempotency.ts — short-lived per-user idempotency lock
// Uses an in-memory Map with TTL (5 min). For multi-instance deployments,
// replace with Redis or a DB table.
const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

type LockEntry = { inFlight: boolean; response?: any; expiresAt: number };
const locks = new Map<string, LockEntry>();

export async function acquireIdempotencyLock(
  userId: string, key: string, scope: string
): Promise<{ cached: boolean; cachedResponse?: any; inFlight: boolean }> {
  const compositeKey = `${scope}:${userId}:${key}`;
  const existing = locks.get(compositeKey);

  if (existing && existing.expiresAt > Date.now()) {
    if (existing.response) {
      return { cached: true, cachedResponse: existing.response, inFlight: false };
    }
    return { cached: false, inFlight: true };  // First request still processing
  }

  // Claim the lock (mark in-flight)
  locks.set(compositeKey, { inFlight: true, expiresAt: Date.now() + LOCK_TTL_MS });
  return { cached: false, inFlight: false };
}

export async function cacheIdempotencyResponse(
  userId: string, key: string, response: any
): void {
  // Find the matching lock by scanning scopes (checkout/portal)
  for (const scope of ['checkout', 'portal']) {
    const compositeKey = `${scope}:${userId}:${key}`;
    const existing = locks.get(compositeKey);
    if (existing?.inFlight) {
      locks.set(compositeKey, { inFlight: false, response, expiresAt: existing.expiresAt });
      return;
    }
  }
}

// Periodic cleanup (call from app startup interval)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of locks) {
    if (entry.expiresAt <= now) locks.delete(key);
  }
}, 60_000);
```

The frontend sends `Idempotency-Key` on each button click:
```typescript
// Frontend: disable button + send unique key per click attempt
const handleCheckout = async (priceId: string) => {
  setLoading(true);
  const idempotencyKey = crypto.randomUUID();
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ priceId }),
  });
  // ... handle response
};
```

**`POST /api/create-checkout`** — Secure checkout session creation:
```typescript
export async function POST(req: Request) {
  // 0. CSRF: Validate origin + Sec-Fetch-Site
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  // 1. Verify authenticated user from Supabase session (server-side)
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Duplicate-click guard: acquire short-lived per-user lock.
  //    Uses Idempotency-Key header (client-generated UUID per button click).
  //    Server caches key → response for 5 min. If same key arrives while
  //    the first request is still in-flight, return 409 immediately.
  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey) {
    return Response.json({ error: 'Missing Idempotency-Key header' }, { status: 400 });
  }
  const lockResult = await acquireIdempotencyLock(user.id, idempotencyKey, 'checkout');
  if (lockResult.cached) {
    return Response.json(lockResult.cachedResponse);  // Return same response as original
  }
  if (lockResult.inFlight) {
    return Response.json({ error: 'Request already in progress' }, { status: 409 });
  }

  // 3. Read priceId from body, validate against server-side allowlist
  const { priceId } = await req.json();
  if (!VALID_PRICE_IDS.has(priceId)) {
    return Response.json({ error: 'Invalid price' }, { status: 400 });
  }

  // 4. Get or create Stripe customer (userId from session, NOT from client)
  const profile = await getProfile(user.id);
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
    customerId = customer.id;
    // Update via service role (bypasses RLS column restriction)
    await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  // 5. Create checkout session — userId from server, not client
  //    Use server-configured canonical URL for redirects (not request origin).
  //    Even with CSRF origin validation, trusting the request origin for redirect
  //    destinations is fragile — a misconfigured CORS/allowlist could redirect
  //    users to unexpected domains.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;  // e.g. https://mcpluginbuilder.com
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${siteUrl}/account?checkout=success`,
    cancel_url: `${siteUrl}/#pricing`,
    metadata: { userId: user.id },  // from server session, never from client
  });

  // Cache the response against the idempotency key (TTL 5min)
  await cacheIdempotencyResponse(user.id, idempotencyKey, { url: session.url });

  return Response.json({ url: session.url });
}
```

**`POST /api/create-portal`** — Stripe Customer Portal:
```typescript
export async function POST(req: Request) {
  // 0. CSRF: Validate origin + Sec-Fetch-Site
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  // 1. Verify authenticated user
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Duplicate-click guard (same Idempotency-Key pattern as checkout)
  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey) {
    return Response.json({ error: 'Missing Idempotency-Key header' }, { status: 400 });
  }
  const lockResult = await acquireIdempotencyLock(user.id, idempotencyKey, 'portal');
  if (lockResult.cached) {
    return Response.json(lockResult.cachedResponse);
  }
  if (lockResult.inFlight) {
    return Response.json({ error: 'Request already in progress' }, { status: 409 });
  }

  // 3. Get profile, verify they have a Stripe customer ID
  const profile = await getProfile(user.id);
  if (!profile.stripe_customer_id) {
    return Response.json({ error: 'No subscription found' }, { status: 400 });
  }

  // 4. Create portal session for THIS user's customer (not client-supplied)
  //    Use server-configured canonical URL (same pattern as checkout hardening)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${siteUrl}/account`,
  });

  await cacheIdempotencyResponse(user.id, idempotencyKey, { url: session.url });

  return Response.json({ url: session.url });
}
```

**`POST /api/webhooks/stripe`** — Webhook with signature verification + idempotency:
```typescript
export async function POST(req: Request) {
  // 1. Read RAW body (not parsed JSON) for signature verification
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  // 2. Verify Stripe signature + timestamp tolerance (rejects tampered/replayed requests).
  //    `constructEvent` validates the `Stripe-Signature` header which includes a `t=` timestamp.
  //    The Stripe SDK enforces a default tolerance of 300 seconds (5 min) — any event with a
  //    timestamp older than 5 minutes is rejected as a potential replay attack. This is
  //    configurable via the optional `tolerance` parameter (in seconds) but the 300s default
  //    is appropriate for production. We pass it explicitly for clarity.
  const WEBHOOK_TIMESTAMP_TOLERANCE_SEC = 300;  // 5 minutes (Stripe default)
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig!, STRIPE_WEBHOOK_SECRET, WEBHOOK_TIMESTAMP_TOLERANCE_SEC
    );
  } catch (err) {
    // Signature mismatch OR timestamp outside tolerance window (replay attempt)
    return new Response('Invalid signature', { status: 400 });
  }

  // 3. Atomic idempotency: claim this event with status='pending'.
  //    INSERT ON CONFLICT ensures only one concurrent delivery wins.
  const { data: claimed } = await supabaseAdmin
    .from('webhook_events')
    .upsert(
      { event_id: event.id, event_type: event.type, status: 'pending' },
      { onConflict: 'event_id', ignoreDuplicates: true }
    )
    .select('event_id');

  if (!claimed || claimed.length === 0) {
    // Row already existed — check if it was processed or still pending/failed
    const { data: existing } = await supabaseAdmin
      .from('webhook_events')
      .select('status, updated_at')
      .eq('event_id', event.id)
      .single();

    if (existing?.status === 'processed') {
      return new Response('Already processed', { status: 200 });
    }

    // If 'pending' — another worker may be handling it. Check if it's stale (>5 min).
    // Uses updated_at (not created_at) because updated_at reflects the last time
    // the row was claimed/touched, surviving re-processing attempts.
    if (existing?.status === 'pending') {
      const ageMs = Date.now() - new Date(existing.updated_at).getTime();
      const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
      if (ageMs < STALE_THRESHOLD_MS) {
        // Still fresh — another handler is working on it. Tell Stripe to retry later.
        // Return 409 (NOT 200) so Stripe retries. 200 = "delivery succeeded" forever.
        return new Response('Processing in progress', { status: 409 });
      }
      // Stale pending — attempt atomic reclaim below
    }

    // Status is 'failed' or stale 'pending' — atomically reclaim ownership.
    // CAS includes the exact updated_at snapshot we previously read, so two
    // concurrent retries that both read the same row cannot BOTH match the
    // WHERE clause — only the first UPDATE to commit wins. The loser sees
    // rowCount=0 because updated_at has already changed.
    const { data: reclaimed } = await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('event_id', event.id)
      .eq('updated_at', existing.updated_at)  // CAS: only match if unchanged since our read
      .in('status', ['failed', 'pending'])
      .select('event_id');

    if (!reclaimed || reclaimed.length === 0) {
      // Another worker already reclaimed it (or it was processed in the meantime)
      return new Response('Reclaim conflict', { status: 409 });
    }
    // Successfully reclaimed — fall through to process below
  }

  // 4. Process event — wrapped in try/catch so failures don't permanently block the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0].price.id;
        const tier = priceIdToTier(priceId);

        // Resolve userId: prefer session metadata, fall back to Stripe customer metadata
        let userId = session.metadata?.userId;
        if (!userId) {
          const customer = await stripe.customers.retrieve(session.customer as string);
          if (customer.deleted) {
            throw new Error(`Customer ${session.customer} is deleted`);
          }
          userId = customer.metadata?.userId;
        }
        if (!userId) {
          throw new Error(`checkout.session.completed missing userId for session ${session.id}`);
        }

        await supabaseAdmin.from('profiles').update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          subscription_tier: tier,
          subscription_status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          builds_used_this_period: 0,  // Reset on new subscription
        }).eq('id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        // Handles upgrades, downgrades, and billing period renewals
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const tier = priceIdToTier(priceId);
        const customerId = subscription.customer as string;

        // Check if this is a new billing period (reset builds)
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('current_period_start')
          .eq('stripe_customer_id', customerId)
          .single();

        const newPeriodStart = new Date(subscription.current_period_start * 1000);
        const isNewPeriod = !profile?.current_period_start ||
          newPeriodStart > new Date(profile.current_period_start);

        await supabaseAdmin.from('profiles').update({
          subscription_tier: tier,
          subscription_status: subscription.status,
          current_period_start: newPeriodStart,
          current_period_end: new Date(subscription.current_period_end * 1000),
          ...(isNewPeriod ? { builds_used_this_period: 0 } : {}),
        }).eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription ended (after failed retries or cancellation at period end)
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin.from('profiles').update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          builds_used_this_period: 0,
        }).eq('stripe_customer_id', subscription.customer as string);
        break;
      }

      case 'invoice.payment_failed': {
        // Mark as past_due but DO NOT downgrade — user paid for current period
        // Stripe Smart Retries will attempt to collect. If all retries fail,
        // Stripe fires customer.subscription.deleted at period end.
        const invoice = event.data.object as Stripe.Invoice;
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('stripe_customer_id', invoice.customer as string);
        break;
      }

      case 'invoice.paid': {
        // Clear past_due status when a retry succeeds or next invoice is paid
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await supabaseAdmin.from('profiles').update({
            subscription_status: subscription.status,  // Should be 'active'
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
          }).eq('stripe_customer_id', invoice.customer as string);
        }
        break;
      }
    }

    // 5. Mark event as successfully processed
    await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('event_id', event.id);

    return new Response('ok', { status: 200 });
  } catch (err) {
    // 6. Mark event as failed — Stripe will retry, and we'll re-process
    console.error(`Webhook processing failed for ${event.id}:`, err);
    await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('event_id', event.id);

    // Return 500 so Stripe retries this event
    return new Response('Processing failed', { status: 500 });
  }
}
```

---

## Phase 6: Backend Auth & Feature Gating

### Files to modify/add in `backend/`:

| File | Action |
|------|--------|
| `backend/requirements.txt` | Add `supabase`, `PyJWT`, `cryptography`, `slowapi` (rate limiting) |
| `backend/app/config.py` | Add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWKS_URL`, `REQUIRE_AUTH`, `ENVIRONMENT` settings |
| `backend/app/services/auth.py` | **New** — JWT verification via JWKS (not raw secret), claim validation |
| `backend/app/middleware/auth.py` | **New** — FastAPI `Depends(require_auth)` dependency |
| `backend/app/middleware/rate_limit.py` | **New** — Rate limiting per user/IP using `slowapi` |
| `backend/app/routes/plugin.py` | Add auth + rate limit dependencies. Add tier limit checks. Keep `/blocks`, `/worlds`, `/health` public. |
| `backend/app/services/code_generator.py` | Add watermark comment injection for free-tier users |

### JWT verification via JWKS (not raw secret)

```python
# backend/app/services/auth.py
import jwt
from jwt import PyJWKClient

# Use JWKS endpoint for key rotation support
jwks_client = PyJWKClient(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json")

def verify_supabase_jwt(token: str) -> dict:
    """Verify JWT using Supabase JWKS. Validates iss, aud, exp, sub."""
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience="authenticated",
        issuer=f"{SUPABASE_URL}/auth/v1",
        options={"require": ["exp", "sub", "aud", "iss"]},
    )
    return payload
```

### Production boot guard

```python
# backend/app/main.py
from app.config import settings

@app.on_event("startup")
async def startup_guard():
    """Fail fast if auth is disabled in production."""
    if settings.ENVIRONMENT == "production" and not settings.REQUIRE_AUTH:
        raise RuntimeError(
            "FATAL: REQUIRE_AUTH=false is not allowed in production. "
            "Set REQUIRE_AUTH=true or ENVIRONMENT=development."
        )
```

### Rate limiting

```python
# backend/app/middleware/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

def get_user_or_ip(request):
    """Rate limit by user ID if authenticated, otherwise by IP."""
    user = getattr(request.state, 'user', None)
    if user:
        return user['id']
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_or_ip)
```

### Limit enforcement in `plugin.py`

**Policy: charge-on-success.** Build quota is only consumed if generation succeeds. If the build fails (Maven error, timeout, etc.), the user doesn't lose a build. This is achieved by reserving the slot first (atomic increment), then rolling back on failure.

```python
@router.post("/generate-plugin")
@limiter.limit("10/minute")
async def generate_plugin(config: PluginConfig, request: Request, user=Depends(require_auth)):
    limits = TIER_LIMITS[user["subscription_tier"]]

    # Event/action count check (cheap — do before quota reservation)
    event_count = sum(1 for b in config.blocks if b.type.value == "event")
    action_count = sum(1 for b in config.blocks if b.type.value != "event")
    if limits["max_events"] != -1 and event_count > limits["max_events"]:
        raise HTTPException(403, f"Your plan allows {limits['max_events']} events max.")
    if limits["max_actions"] != -1 and action_count > limits["max_actions"]:
        raise HTTPException(403, f"Your plan allows {limits['max_actions']} actions max.")

    # Config size check (defense in depth, DB also enforces)
    config_size = len(config.json())
    if config_size > 512_000:
        raise HTTPException(400, "Plugin config exceeds 500KB limit.")

    # Reserve build slot (atomic increment — prevents race conditions)
    # Function handles both paid (Stripe period) and free (calendar month) resets
    result = await supabase_admin.rpc('increment_build_count', {
        'p_user_id': user['id'],
        'p_max_builds': limits['builds_per_period'],
    }).execute()
    if not result.data:
        raise HTTPException(403, "Build limit reached for this period. Upgrade your plan.")

    # Generate — if this fails, roll back the build count
    try:
        download_id = await plugin_generator.generate(config)
    except Exception as e:
        # Roll back: decrement build count so user doesn't lose a slot
        await supabase_admin.rpc('decrement_build_count', {
            'p_user_id': user['id'],
        }).execute()
        # Log failed build (no download_id)
        await supabase_admin.from_('build_logs').insert({
            'user_id': user['id'],
            'plugin_name': config.name,
            'event_count': event_count,
            'action_count': action_count,
            'status': 'failed',
        }).execute()
        raise HTTPException(500, "Plugin generation failed. Your build quota was not consumed.")

    # Log successful build with download_id for ownership verification
    await supabase_admin.from_('build_logs').insert({
        'user_id': user['id'],
        'download_id': download_id,
        'plugin_name': config.name,
        'event_count': event_count,
        'action_count': action_count,
        'status': 'success',
    }).execute()
    # ... return response
```

Atomic build increment (Postgres function):
```sql
-- Atomically increment build count, returns true if allowed, false if limit reached.
-- Handles both paid users (Stripe billing period) and free users (calendar month fallback).
-- Uses dedicated build_period_start column (not updated_at, which changes on any profile update).
CREATE OR REPLACE FUNCTION increment_build_count(
  p_user_id UUID,
  p_max_builds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
  user_period_end TIMESTAMPTZ;
  user_period_start TIMESTAMPTZ;
BEGIN
  -- Fetch current period info for this user
  SELECT current_period_end, build_period_start
  INTO user_period_end, user_period_start
  FROM public.profiles WHERE id = p_user_id;

  -- Reset counter if period has ended:
  --   Paid users: current_period_end is set by Stripe webhook
  --   Free users: current_period_end is NULL → use calendar month boundary via build_period_start
  IF user_period_end IS NOT NULL AND user_period_end < now() THEN
    -- Paid user whose billing period has ended
    UPDATE public.profiles
    SET builds_used_this_period = 0
    WHERE id = p_user_id;
  ELSIF user_period_end IS NULL THEN
    -- Free user: reset if build_period_start is in a previous calendar month
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

-- Roll back a build count on generation failure (charge-on-success policy).
-- Floor at 0 to prevent underflow.
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
```

---

## Phase 7: Builder App (Vite Frontend) Integration

### Files to modify/add in `frontend/`:

| File | Action |
|------|--------|
| `frontend/package.json` | Add `@supabase/supabase-js` |
| `frontend/src/services/supabase.js` | **New** — Supabase client init (same project URL + anon key, cookie domain config) |
| `frontend/src/store/useAuthStore.js` | **New** — Auth state (user, session, tier, projects list) |
| `frontend/src/services/projectService.js` | **New** — CRUD for projects with optimistic concurrency (version field) |
| `frontend/src/services/api.js` | Add axios interceptor to attach `Authorization: Bearer <jwt>` header |
| `frontend/src/App.jsx` | Check auth on load; show login redirect overlay for unauthenticated users; load project list |
| `frontend/src/components/UpgradePrompt.jsx` | **New** — Shown when user hits tier limits |
| `frontend/src/components/ProjectList.jsx` | **New** — "My Projects" sidebar/modal: create, open, rename, delete, archive |

### Project persistence with optimistic concurrency

```javascript
// frontend/src/services/projectService.js
export async function saveProject(projectId, config, currentVersion) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      config,
      version: currentVersion + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('version', currentVersion)  // Only succeeds if version matches
    .select()
    .single();

  if (error || !data) {
    // Version conflict — another tab/device saved first
    throw new Error('CONFLICT: Project was modified elsewhere. Please reload.');
  }
  return data;
}
```

Auto-save with debounce (5s) and conflict detection. On conflict, prompt user to reload or overwrite.

### Frontend feature gating (what's restricted per tier)

| UI Element | Free Tier | Premium | Pro |
|-----------|-----------|---------|-----|
| Block palette — events | Only 4 shown, rest locked with lock icon | All 20 | All 20 |
| Block palette — actions | Only 8 shown, rest locked | All 50 | All 50 |
| "Generate Plugin" button | Active (if builds remaining) | Active | Active |
| "Create New Project" | Disabled after 1 active project | Always active | Always active |
| Build counter badge | "0/1 builds" in header | "X/5 builds" | "X/20 builds" |
| Locked block click | Shows UpgradePrompt modal | — | — |

---

## Phase 8: SEO Hardening (Next.js)

### Goals
- Maximize indexability and rich-result eligibility for public marketing pages.
- Prevent private/auth pages from being indexed.
- Keep Core Web Vitals stable as landing content grows.

### Indexing Scope
- **Indexable**: `/`, public marketing sections/pages, public docs/blog pages (if added).
- **Noindex**: `/login`, `/signup`, `/reset-password`, `/account`, `/billing`, webhook/API routes.
- Add explicit robots rules in route metadata for non-public pages:
```typescript
// app/login/layout.tsx (and all auth pages)
export const metadata = {
  robots: { index: false, follow: false },
};
```

### Canonical + URL Hygiene
- Set a single canonical origin via env: `NEXT_PUBLIC_SITE_URL=https://mcpluginbuilder.com`.
- Emit canonical tags for all indexable pages:
```typescript
// app/layout.tsx
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  alternates: { canonical: '/' },
};
```
- Enforce one preferred host in production (redirect `www` ↔ apex consistently) via Next.js middleware:
```typescript
// middleware.ts
if (req.nextUrl.hostname.startsWith('www.')) {
  const url = req.nextUrl.clone();
  url.hostname = url.hostname.replace('www.', '');
  return NextResponse.redirect(url, 301);
}
```
- Normalize trailing slash behavior via `next.config.js` `trailingSlash: false` and avoid duplicate URL variants.

### Metadata Requirements
- Per-page unique `title` and `description` (no site-wide duplicates).
- Open Graph + Twitter metadata for all indexable pages:
```typescript
// app/page.tsx (homepage example)
export const metadata: Metadata = {
  title: 'MC Plugin Builder — Create Minecraft Plugins Without Code',
  description: 'Drag-and-drop Minecraft plugin builder for Paper 1.21. No Java knowledge required.',
  openGraph: {
    title: 'MC Plugin Builder — Create Minecraft Plugins Without Code',
    description: 'Drag-and-drop Minecraft plugin builder for Paper 1.21.',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'MC Plugin Builder',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MC Plugin Builder',
    description: 'Create Minecraft plugins without code.',
    images: ['/og-image.png'],
  },
};
```
- Generate/share a consistent social image (`1200x630`) and version it on major rebrands.

### Structured Data (JSON-LD)
- **`SoftwareApplication`** on homepage:
```typescript
// app/page.tsx — JSON-LD script tag
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MC Plugin Builder',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
    { '@type': 'Offer', price: '4.99', priceCurrency: 'USD', name: 'Premium' },
    { '@type': 'Offer', price: '9.99', priceCurrency: 'USD', name: 'Pro' },
  ],
};
```
- **`FAQPage`** JSON-LD if FAQ content is visible on-page (emit alongside FAQ accordion).
- **`Organization`** JSON-LD (name, URL, logo, socials) in root layout.
- Validate schema in CI using Rich Results Test-compatible checks.

### robots.txt + sitemap.xml
```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/account', '/billing', '/api/', '/login', '/signup', '/reset-password'] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```
```typescript
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    // Add public pages only — exclude auth/account/API routes
  ];
}
```
- Ensure sitemap only includes canonical, indexable URLs (exclude auth/private pages).
- Add `lastmod` for pages generated from changing content.

### International/Alternate URLs (Future-ready)
- If localization is added, emit `hreflang` alternate links and locale-specific canonicals.
- Do not ship partial locale pages indexable without full metadata parity.

### Performance + Core Web Vitals
- **Budgets:**
  - LCP < 2.5s (p75)
  - CLS < 0.1 (p75)
  - INP < 200ms (p75)
- **Hero/media optimization:**
  - Use `next/image` for raster assets.
  - Preload critical font(s) (`Press Start 2P`); use `font-display: swap`.
  - Avoid large client bundles in above-the-fold sections.
- Keep landing page sections mostly server-rendered; isolate interactive widgets (pricing toggle, FAQ accordion, mobile menu) as small client components.

### Rendering Strategy
- Public marketing pages: **SSG/ISR preferred** (static at build time, revalidate periodically).
- Account/auth pages: **dynamic** + noindex.
- Avoid accidental `noindex` inheritance on public routes (verify each route's metadata independently).

### Security Headers That Also Protect SEO Integrity
```typescript
// next.config.js headers
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ],
  }, {
    source: '/api/:path*',
    headers: [
      { key: 'X-Robots-Tag', value: 'noindex' },
    ],
  }];
}
```
- Add `Strict-Transport-Security` in production (via hosting provider or middleware).
- Ensure security middleware does not block search crawler access to public HTML/CSS/JS.

### Analytics + Search Console
- Configure **Google Search Console** + **Bing Webmaster Tools**.
- Submit sitemap on launch.
- Track:
  - Indexed pages count
  - Crawl errors
  - Core Web Vitals (field data)
  - Top queries / CTR for "Minecraft plugin builder" intent terms

### SEO Verification Checklist
1. Public homepage has canonical, OG/Twitter tags, and valid JSON-LD (`SoftwareApplication`).
2. `/account`, `/login`, `/signup`, `/reset-password` return `noindex` meta tag.
3. `robots.txt` and `sitemap.xml` are reachable at root and well-formed.
4. Sitemap excludes private/auth/API routes; includes only canonical URLs.
5. Lighthouse SEO score >= 95 on homepage.
6. Rich Results validation passes for `SoftwareApplication` (+ `FAQPage` if used).
7. Host canonicalization redirect works in production (`www` → apex or vice versa).
8. API routes return `X-Robots-Tag: noindex` header.
9. `Press Start 2P` font preloaded with `font-display: swap` — no layout shift.
10. No duplicate `title`/`description` across routes.

---

## Environment Variables

### `landing/.env.local`
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Production: https://mcpluginbuilder.com (used for canonical URLs, checkout/portal redirects, OG metadata)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BUILDER_URL=http://localhost:5173
NEXT_PUBLIC_APP_DOMAIN=localhost           # Production: .mcpluginbuilder.com
```

### `backend/.env` (additions)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
REQUIRE_AUTH=false
ENVIRONMENT=development                    # Production: production (enforces REQUIRE_AUTH=true)
```

### `frontend/.env` (additions)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_LANDING_URL=http://localhost:3000
VITE_APP_DOMAIN=localhost                  # Production: .mcpluginbuilder.com
```

---

## Implementation Order

| # | Task | Depends On |
|---|------|------------|
| 1 | Scaffold Next.js app at `landing/` | — |
| 2 | Set up Supabase project + run DB schema (profiles, projects, build_logs, webhook_events, RPC functions) | — |
| 3 | Configure Supabase client files in `landing/` (with cookie domain config) | 1, 2 |
| 4 | Build design system (globals.css, MinecraftButton, MinecraftCard, AnimatedSection) | 1 |
| 5 | Build landing page sections (Hero → Footer) | 4 |
| 6 | Build auth pages (signup, login, callback, reset-password) | 3 |
| 7 | Build account dashboard page | 6 |
| 8 | Set up Stripe products/prices in dashboard | — |
| 9 | Build Stripe API routes (create-checkout with price allowlist, create-portal, webhook with signature + idempotency) | 3, 8 |
| 10 | Wire pricing card CTAs to Stripe checkout | 5, 9 |
| 11 | Add auth middleware to FastAPI backend (JWKS verification, boot guard) | 2 |
| 12 | Add rate limiting + tier limit enforcement to backend routes | 11 |
| 13 | Add Supabase + auth store to Vite builder frontend (cookie domain SSO) | 2 |
| 14 | Add auth header interceptor to builder API service | 13 |
| 15 | Build project persistence layer (with optimistic concurrency + config size limits) | 13 |
| 16 | Add upgrade prompts + feature gating UI in builder (locked blocks, build counter) | 14, 15 |
| 17 | Add watermark to code generator for free tier | 12 |
| 18 | SEO hardening: metadata, canonical, OG/Twitter, JSON-LD, robots.txt, sitemap.xml, security headers, Core Web Vitals, rendering strategy | 5 |
| 19 | Security testing + responsive testing + cross-app auth E2E testing | All |

---

## Verification Plan

1. **Landing page**: `cd landing && npm run dev` → visit `localhost:3000`, verify all sections render, responsive on mobile/tablet
2. **Auth flow**: Sign up → receive confirmation email → log in → see account page → log out
3. **Cross-app SSO**: Log in on landing → navigate to builder URL → verify user is already authenticated (no login prompt)
4. **Stripe flow**: Click "Get Premium" → Stripe Checkout opens → use test card `4242 4242 4242 4242` → redirected to account → tier shows "Premium"
5. **Webhook security**: Send unsigned POST to `/api/webhooks/stripe` → 400. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → verify profile updated. Send same event again → "Already processed" (idempotent).
6. **RLS column protection**: Via Supabase client, try `supabase.from('profiles').update({ subscription_tier: 'pro' })` → should fail / have no effect on tier column.
7. **Free tier project limit**: Create 1 project → try creating a second → DB trigger rejects with error. Try direct Supabase insert → also rejected.
8. **Backend gating**: With `REQUIRE_AUTH=true`, call `POST /api/generate-plugin` without auth header → 401. With valid token + free tier + 5 events → 403.
9. **Rate limiting**: Send 15 rapid requests to `/api/generate-plugin` → 429 after 10th.
10. **Build quota atomicity**: Send 2 concurrent build requests when user has 1 build remaining → only 1 succeeds, other gets 403.
11. **Project concurrency**: Open project in 2 tabs → edit in both → save in tab A → save in tab B → tab B gets conflict error.
12. **Boot guard**: Set `ENVIRONMENT=production` + `REQUIRE_AUTH=false` → backend fails to start with clear error.
13. **Config size limit**: Try saving a project with >500KB config → rejected by DB constraint.
14. **Payment failure**: Use Stripe test card `4000 0000 0000 0341` (attach succeeds, charge fails) → profile status becomes `past_due` but tier remains active. After period ends → subscription deleted → tier becomes `free`.
15. **Free-tier build reset**: Create a free user → use 1 build → manually set `build_period_start` to last month in DB → next build request succeeds (counter was reset via calendar-month fallback). Verify updating `display_name` does NOT reset the counter.
16. **Unarchive bypass**: Free user with 1 active project → archive it → create a new project → try to unarchive the old one → DB trigger rejects with error.
17. **Webhook duplicate delivery**: Send same Stripe event ID twice concurrently → only one processes, second returns "Already processed".
18. **Missing checkout metadata**: Simulate `checkout.session.completed` with null `metadata.userId` but valid customer with `metadata.userId` on the Stripe customer object → profile still updated correctly via fallback. With neither metadata → returns 500, event marked 'failed', Stripe retries.
19. **Payment retry clears past_due**: Set profile to `past_due` → trigger `invoice.paid` webhook → profile status restored to `active`.
20. **Free user display_name update**: As a free user (NULL billing columns) → update `display_name` via Supabase client → succeeds (IS NOT DISTINCT FROM handles NULLs).
21. **Download ownership**: Generate plugin as user A → try downloading as user B → 403/404. User A can download → 200.
22. **Webhook failure recovery**: Trigger a webhook where handler logic fails (e.g. mock Stripe API error) → event marked `status='failed'` in `webhook_events`, returns 500 → Stripe retries → second attempt succeeds, event marked `status='processed'`.
23. **Concurrent project creation**: Two rapid concurrent INSERT requests for a free-tier user → advisory lock ensures only one succeeds, other gets "Free tier limited to 1 active project" error.
24. **CSRF on checkout/portal**: POST to `/api/create-checkout` with valid auth cookie but `Origin: https://evil.com` → 403 Forbidden.
25. **Build failure rollback**: Trigger a build that fails (e.g. invalid config causing Maven error) → build count is decremented back, user gets 500 with "quota was not consumed" message. Build log recorded with `status='failed'`.

---

## Security Audit Checklist

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Token in URL query leaks auth credentials | P0 | **Fixed:** Replaced with shared cookie domain SSO (`.mcpluginbuilder.com`). No tokens in URLs. |
| 2 | RLS allows users to self-upgrade tier/build counters | P0 | **Fixed:** UPDATE policy uses `WITH CHECK` to block changes to protected columns. Only service role can modify billing fields. |
| 3 | Free-tier project limit enforced only in app logic | P0 | **Fixed:** DB trigger `enforce_project_limit` runs on INSERT, checks tier and active count. Not bypassable. |
| 4 | Stripe webhook idempotency incomplete | P1 | **Fixed:** Signature verification on raw body + `webhook_events` table for dedup by `event.id`. |
| 5 | JWT verification too weak for key rotation | P1 | **Fixed:** Using Supabase JWKS endpoint (`/.well-known/jwks.json`) with full claim validation (iss, aud, exp, sub). |
| 6 | `REQUIRE_AUTH=false` could ship to production | P1 | **Fixed:** Startup boot guard fails if `ENVIRONMENT=production` and `REQUIRE_AUTH=false`. |
| 7 | Checkout/portal endpoint abuse | P1 | **Fixed:** Auth required, userId from server session (not client), price ID validated against server-side allowlist, portal session created for caller's own Stripe customer only. |
| 8 | Subscription status enum incomplete | P1 | **Fixed:** Added `incomplete`, `incomplete_expired`, `unpaid`, `paused` to DB constraint. |
| 9 | No rate limiting on API endpoints | P1 | **Fixed:** `slowapi` rate limiter added per-user for auth'd endpoints, per-IP for public endpoints. |
| 10 | Build reset conflicts with billing cycle | P2 | **Fixed:** Resets aligned to Stripe billing period (`current_period_start`/`end`), not calendar month. |
| 11 | Missing optimistic concurrency for autosave | P2 | **Fixed:** `version` column on projects table. UPDATE uses `eq('version', currentVersion)`. Conflict → user prompted. |
| 12 | No config JSONB size limit | P2 | **Fixed:** DB constraint `config_max_size` (500KB). Backend also validates before processing. |
| 13 | Free-tier builds never reset (`current_period_end` is NULL, so `increment_build_count` never resets counter) | P0 | **Fixed:** `increment_build_count` now handles NULL `current_period_end` with calendar-month fallback. Free users reset at start of each month. |
| 14 | Unarchive bypasses project limit (trigger only on INSERT; user can archive→create→unarchive to exceed limit) | P0 | **Fixed:** Added `BEFORE UPDATE` trigger `enforce_project_limit_on_unarchive` that fires when `is_archived` changes from `true` to `false`. |
| 15 | Webhook idempotency race condition (SELECT-then-INSERT allows concurrent deliveries to both process) | P1 | **Fixed:** Replaced with atomic `INSERT ... ON CONFLICT (event_id) DO NOTHING` via Supabase `upsert` with `ignoreDuplicates`. Only the first delivery gets a row back. |
| 16 | `checkout.session.completed` trusts nullable `metadata.userId` without guard | P1 | **Fixed:** Added null guard with fallback to Stripe customer metadata lookup. Logs error and skips (allowing Stripe retry) if userId unresolvable. |
| 17 | `past_due` status never clears after successful retry payment | P1 | **Fixed:** Added `invoice.paid` webhook handler that restores `subscription_status` from Stripe and updates period dates. |
| 18 | RLS `WITH CHECK` uses `=` which fails on NULL columns (blocks free users from updating display_name) | P1 | **Fixed:** Changed all comparisons to `IS NOT DISTINCT FROM` for NULL-safe equality checks. |
| 19 | `domain: 'localhost'` for cookies is unreliable across browsers | P2 | **Fixed:** Local dev omits `domain` attribute entirely. Browser default host-only cookie for `localhost` is shared across ports. |
| 20 | Download ownership check underspecified (no `download_id` in `build_logs`) | P2 | **Fixed:** Added `download_id TEXT` column + index to `build_logs`. Backend logs `download_id` on build. Download route verifies `build_logs.download_id` matches requesting user. |
| 21 | Webhook event marked processed before business logic succeeds — failures permanently block retry | P0 | **Fixed:** `webhook_events` now has `status` column (`pending`/`processed`/`failed`). Event claimed as `pending` first, marked `processed` only after success. On failure, marked `failed` + returns 500 so Stripe retries. Failed events can be re-processed on retry. |
| 22 | "Missing userId will be retried" was false — `break` + return 200 meant event was silently lost | P0 | **Fixed:** Missing userId now throws error (caught by try/catch), event marked `failed`, returns 500. Stripe retries the event. |
| 23 | Free-tier build reset uses `updated_at` which changes on any profile update (display name, etc.) | P1 | **Fixed:** Added dedicated `build_period_start` column. `increment_build_count` checks `build_period_start < date_trunc('month', now())` instead of `updated_at`. Profile updates no longer affect build resets. |
| 24 | Free-project limit trigger races on concurrent inserts (both read count=0, both pass) | P1 | **Fixed:** Added `pg_advisory_xact_lock(hashtext(user_id))` in both INSERT and UPDATE triggers. Serializes concurrent project operations per-user. Lock auto-releases at transaction end. |
| 25 | CSRF not explicit for cookie-based checkout/portal routes | P1 | **Fixed:** Added `validateOrigin()` check on `POST /api/create-checkout` and `POST /api/create-portal`. Validates `Origin` header against allowlist of known domains. Rejects cross-origin requests with 403. |
| 26 | Build quota consumed before generation success — failed builds waste user's quota | P2 | **Fixed:** Charge-on-success policy. Quota is reserved (increment) before build, then rolled back via `decrement_build_count` RPC if generation fails. Failed builds logged with `status='failed'`. User informed quota was not consumed. |
| 27 | Webhook pending status can get stuck forever — returning 200 for pending tells Stripe delivery succeeded, so it stops retrying. If the handler crashes, the event is permanently stuck. | P0 | **Fixed:** Returns 409 (not 200) for fresh pending events, so Stripe retries later. Added stale-pending reclaim: if `updated_at` is >5 minutes old (handler likely crashed), the event is atomically reclaimed via CAS and re-processed by the next delivery. Staleness is always measured against `updated_at` (not `created_at`). |
| 28 | `build_jobs` RLS `user_id IS NULL` leaks all dev/null-user jobs to any authenticated user | P1 | **Fixed:** RLS policy changed to `auth.uid() = user_id` only. NULL `user_id` rows (local dev) are only accessible via service role (which bypasses RLS). Authenticated users can only see their own jobs. |
| 29 | Per-user queue cap has TOCTOU race (count-then-insert allows concurrent requests to both pass the check) | P1 | **Fixed:** Replaced with atomic `enqueue_build_job()` DB function that acquires `pg_advisory_xact_lock` per-user, checks active count, and inserts in one transaction. Same pattern as project limit trigger. |
| 30 | Build quota + async queue integration underspecified — unclear where quota is reserved/released in job lifecycle | P1 | **Fixed:** Quota is reserved (`increment_build_count`) at job submission (POST route). On build failure, worker calls `decrement_build_count` to refund. On enqueue failure, route refunds immediately. Full lifecycle documented in `_process_job` docstring. |
| 31 | Stored `artifact_url` becomes stale — signed URLs expire after TTL but the DB column retains the expired URL | P1 | **Fixed:** Removed `artifact_url` column from `build_jobs` schema. Signed URLs are generated on-the-fly in `GET /api/build-jobs/{id}` by calling `artifact_storage.get_download_url()`. Each poll returns a fresh URL. |
| 32 | No payload size bound on `build_jobs.plugin_config` — unbounded JSONB allows DoS via large payloads | P2 | **Fixed:** DB CHECK constraint `octet_length(plugin_config::text) <= 524288` (512KB). Also validated in `enqueue_build_job()` DB function before insert. `plugin_name` capped at 200 chars. |
| 33 | Quota RPC call mismatch — `POST /api/build-jobs` calls `increment_build_count` with only `p_user_id`, but function signature requires `p_user_id` + `p_max_builds` | P0 | **Fixed:** Route now fetches user profile to get `subscription_tier`, looks up `TIER_LIMITS[tier]["builds_per_period"]`, and passes both `p_user_id` and `p_max_builds` to the RPC call. |
| 34 | Webhook reclaim path is race-prone — failed/stale-pending "falls through" to process without atomically re-claiming ownership. Two retries can process simultaneously. | P1 | **Fixed:** Added atomic CAS (compare-and-swap) UPDATE that sets `status='pending'` + `updated_at=now()` only WHERE status IN (`failed`, `pending`). Only one concurrent retry wins the UPDATE. Losers get 409 back. |
| 35 | Pending staleness uses `created_at` — if event is re-processed, `created_at` never changes so staleness threshold is wrong | P1 | **Fixed:** Added `updated_at` column to `webhook_events`. Staleness check now uses `updated_at` (set on every claim/reclaim/processed/failed transition). All status transitions now also set `updated_at`. |
| 36 | Cross-period quota reservation undefined — jobs queued at billing boundary could cause disputes about which period the build counts against | P2 | **Fixed:** Explicit policy: quota is tied to SUBMISSION period, not execution period. `increment_build_count` ran at submission time against the current period. `decrement_build_count` uses `GREATEST(n-1, 0)` to handle edge case where Stripe webhook resets counter mid-build. Documented in `_process_job` docstring. |
| 37 | Webhook reclaim CAS checks only `status IN (...)` without `updated_at` snapshot — two concurrent retries can both match | P1 | **Fixed:** CAS UPDATE now includes `.eq('updated_at', existing.updated_at)` so only the retry that read the exact same snapshot wins. Losers see rowCount=0 because `updated_at` has already changed. |
| 38 | Stuck-job recovery marks jobs failed but doesn't refund reserved build quota (worker's Python `except` block never runs if worker dies hard) | P0 | **Fixed:** `recover_stuck_build_jobs()` DB function now iterates stuck jobs with `FOR UPDATE SKIP LOCKED` and calls `decrement_build_count(user_id)` for each recovered job atomically. |
| 39 | Checkout `success_url`/`cancel_url` use request origin — fragile if CORS/allowlist misconfigured | P1 | **Fixed:** Redirect URLs now use `process.env.NEXT_PUBLIC_SITE_URL` (server-configured canonical URL) instead of `origin` from the request. |
| 40 | `MAX_CONCURRENT_BUILDS` is per-instance, not cluster-wide — N replicas allow N× concurrent builds | P2 | **Documented:** Per-instance semaphore is acceptable for v1 (single replica). DB-side `FOR UPDATE SKIP LOCKED` prevents double-processing. Added optional cluster-wide concurrency limit SQL snippet for multi-replica deployment. |
| 41 | Artifact filenames derive from user-influenced fields without sanitization — path traversal risk | P1 | **Fixed:** Added `_sanitize_filename()` to `BuildWorker`. Strips path components (`../`), replaces non-safe characters with `_`, prevents hidden files. Applied before storage path construction and DB insert. |
| 42 | Verification item 43 says free-tier `p_max_builds=3` but PLANS definition shows `buildsPerPeriod: 1` | P2 | **Fixed:** Corrected verification plan to use `p_max_builds=1` matching the PLANS constant. Added premium (5) and pro (-1 = unlimited) test cases. |
| 43 | `create-portal` `return_url` uses `origin` (undefined in snippet) while checkout was hardened to `siteUrl` | P1 | **Fixed:** Portal now uses `process.env.NEXT_PUBLIC_SITE_URL` for `return_url`, matching checkout hardening. |
| 44 | Stuck-job recovery count uses `GET DIAGNOSTICS ROW_COUNT` after a loop — only reflects last statement, under-reports | P2 | **Fixed:** Replaced with explicit `recovered_count := recovered_count + 1` inside the loop. `GET DIAGNOSTICS` removed. |
| 45 | Optional global concurrency snippet (`SELECT count(*) WHERE status='running'`) is race-prone without locking | P2 | **Fixed:** Rewritten to use `pg_advisory_xact_lock` inside `claim_next_build_job` before the count check. Advisory lock serializes all claim attempts cluster-wide. Count + claim are now atomic. |
| 46 | `_recovery_task` and `_cleanup_task` not cancelled/awaited in `stop()` — dangling tasks on shutdown | P2 | **Fixed:** `stop()` now cancels and awaits both `_recovery_task` and `_cleanup_task` with `CancelledError` handling. |
| 47 | `NEXT_PUBLIC_SITE_URL` used in checkout/portal/SEO but missing from env docs | P2 | **Fixed:** Added `NEXT_PUBLIC_SITE_URL` to `landing/.env.local` section with local dev default and production note. |
| 48 | Checkout/portal duplicate-click race — rapid clicks create multiple Stripe sessions/customers | P1 | **Fixed:** Added `Idempotency-Key` header requirement on both `/api/create-checkout` and `/api/create-portal`. Server acquires short-lived per-user lock (5 min TTL). In-flight duplicates get 409; completed duplicates return cached response. Frontend generates `crypto.randomUUID()` per click. |
| 49 | Origin-only CSRF check can be brittle — some clients/proxies strip Origin header | P1 | **Fixed:** `validateOrigin()` now has `Sec-Fetch-Site` fallback. If `Origin` is missing/invalid, accepts `Sec-Fetch-Site: same-origin` or `same-site` (browser-enforced, cannot be spoofed by JS). Rejects only if neither header validates. |
| 50 | Webhook signature verification doesn't document timestamp tolerance/replay window | P2 | **Fixed:** `constructEvent` now explicitly passes `WEBHOOK_TIMESTAMP_TOLERANCE_SEC = 300` (5 min). Added inline documentation explaining Stripe SDK's `t=` timestamp validation and replay rejection behavior. |
| 51 | Stale-pending verification wording in audit item #27 still references `created_at` language | P2 | **Fixed:** Aligned wording to explicitly say `updated_at` in audit item #27. All stale-pending documentation now consistently references `updated_at`. |

---

## Phase 9: Async Build Queue & Artifact Storage

### Context: Why This Phase Exists

The current build system has critical production issues:
- `subprocess.run("mvn clean package")` blocks the async event loop for up to 120s
- In-memory `_download_registry` dict is lost on restart / doesn't work with multi-worker
- JAR files in `./downloads/` are never cleaned up
- No concurrency control — simultaneous Maven builds can spike CPU/RAM
- No build status tracking — client waits up to 120s with no progress feedback

This phase replaces the synchronous, in-memory build pipeline with an async job queue backed by Postgres + Supabase Storage.

### Architecture Overview

```
Frontend (Vite)                FastAPI Routes              BuildWorker              Supabase
   |                              |                          |                     Postgres + Storage
   |  POST /api/build-jobs        |                          |                       |
   |----------------------------->|  INSERT build_jobs        |                       |
   |  { job_id, status=queued }   |  (status=queued)         |                       |
   |<-----------------------------|--------------------------------------------->    |
   |                              |  worker.notify()         |                       |
   |                              |------------------------->|                       |
   |  (poll 2s)                   |                          | claim_next_build_job()|
   |  GET /api/build-jobs/{id}    |                          |  FOR UPDATE SKIP LOCKED
   |----------------------------->|                          |---------------------->|
   |  { status=running }          |                          |                       |
   |<-----------------------------|                          | generate_all()        |
   |                              |                          | write_files()         |
   |  (poll 2s)                   |                          | asyncio subprocess mvn|
   |  GET /api/build-jobs/{id}    |                          | upload JAR to Storage |
   |----------------------------->|                          |---------------------->|
   |  { status=succeeded,         |  generate fresh signed   | UPDATE succeeded      |
   |    artifact_url=<fresh> }    |  URL on-the-fly          |                       |
   |<-----------------------------|                          |                       |
   |  window.open(artifact_url)   |                          |                       |
   |--------------------------------------------------------------------->          |
```

### Database Schema: `build_jobs` Table

```sql
CREATE TABLE public.build_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (nullable for REQUIRE_AUTH=false local dev)
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Status lifecycle: queued → running → succeeded | failed
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),

  -- Input (immutable after creation)
  plugin_config JSONB NOT NULL
    CHECK (octet_length(plugin_config::text) <= 524288),  -- 512KB max payload
  plugin_name TEXT NOT NULL
    CHECK (char_length(plugin_name) <= 200),

  -- Output (populated on success)
  artifact_storage_path TEXT,       -- "builds/<job_id>/<name>.jar" (permanent path)
  -- NOTE: No artifact_url column. Signed download URLs are generated on-the-fly
  -- via GET /api/build-jobs/{id} to avoid stale/expired URLs being stored in DB.
  artifact_size_bytes INTEGER,
  jar_filename TEXT,                -- e.g. "my-plugin-1.0.0.jar"

  -- Error (populated on failure)
  error_message TEXT,

  -- Worker tracking
  worker_id TEXT,
  heartbeat_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  build_dir TEXT,                   -- "/tmp/builds/<job_id>" for cleanup

  -- Timestamps + expiry
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  artifact_expires_at TIMESTAMPTZ   -- NULL = no expiry; default: created_at + 24h
);

-- Worker poll index (only queued jobs, FIFO)
CREATE INDEX idx_build_jobs_queued ON public.build_jobs (status, created_at)
  WHERE status = 'queued';
-- User's job history
CREATE INDEX idx_build_jobs_user ON public.build_jobs (user_id, created_at DESC);
-- Stuck job detection
CREATE INDEX idx_build_jobs_heartbeat ON public.build_jobs (status, heartbeat_at)
  WHERE status = 'running';
-- Artifact expiry cleanup
CREATE INDEX idx_build_jobs_expiry ON public.build_jobs (artifact_expires_at)
  WHERE artifact_expires_at IS NOT NULL AND status = 'succeeded';

-- RLS
ALTER TABLE public.build_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own jobs. NULL user_id rows (local dev) are only
-- accessible via service role (which bypasses RLS). This prevents authenticated
-- users from seeing all dev/unowned jobs.
CREATE POLICY "Users can view own build jobs"
  ON public.build_jobs FOR SELECT USING (
    auth.uid() = user_id
  );
-- No INSERT/UPDATE policies = only service role can write
```

### Atomic Job Claiming (prevents double-processing)

```sql
CREATE OR REPLACE FUNCTION claim_next_build_job(
  p_worker_id TEXT
) RETURNS UUID AS $$
DECLARE
  claimed_id UUID;
BEGIN
  UPDATE public.build_jobs
  SET status = 'running',
      worker_id = p_worker_id,
      started_at = now(),
      heartbeat_at = now(),
      updated_at = now()
  WHERE id = (
    SELECT id FROM public.build_jobs
    WHERE status = 'queued'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED  -- Prevents multiple workers from claiming same job
  )
  RETURNING id INTO claimed_id;

  RETURN claimed_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Stuck Job Recovery

```sql
-- Recovers stuck jobs AND refunds reserved build quota for each recovered job.
-- This is critical because if the worker process dies hard (OOM, kill -9), the
-- Python-side quota refund in the except block never runs. This DB function
-- handles both atomically.
CREATE OR REPLACE FUNCTION recover_stuck_build_jobs(
  p_timeout_minutes INTEGER DEFAULT 5
) RETURNS INTEGER AS $$
DECLARE
  recovered_count INTEGER := 0;  -- Explicit counter (GET DIAGNOSTICS after a loop only reflects last statement)
  stuck_job RECORD;
BEGIN
  -- Find stuck jobs and refund quota for each one
  FOR stuck_job IN
    SELECT id, user_id FROM public.build_jobs
    WHERE status = 'running'
      AND heartbeat_at < now() - (p_timeout_minutes || ' minutes')::interval
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Mark as failed
    UPDATE public.build_jobs
    SET status = 'failed',
        error_message = 'Build timed out (no heartbeat for ' || p_timeout_minutes || ' minutes)',
        completed_at = now(),
        updated_at = now()
    WHERE id = stuck_job.id;

    -- Refund reserved quota (if user_id is set)
    IF stuck_job.user_id IS NOT NULL THEN
      PERFORM decrement_build_count(stuck_job.user_id);
    END IF;

    recovered_count := recovered_count + 1;
  END LOOP;

  RETURN recovered_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST /api/build-jobs` | Yes (optional in dev) | Submit build job, returns `job_id` immediately |
| `GET /api/build-jobs/{id}` | Yes (optional in dev) | Poll job status + get download URL |
| `POST /api/generate-plugin` | Yes (optional in dev) | **Deprecated:** sync wrapper that creates job + polls internally |
| `GET /api/download/{id}` | Yes (optional in dev) | **Deprecated:** looks up `build_jobs` by ID instead of in-memory registry |

**POST /api/build-jobs** — Per-user queue limit enforcement (atomic via DB function):

The count-then-insert pattern is racy — two concurrent requests can both read count=1 and both insert. Instead, use a DB function that acquires an advisory lock, checks the count, and inserts atomically:

```sql
CREATE OR REPLACE FUNCTION enqueue_build_job(
  p_user_id UUID,
  p_plugin_config JSONB,
  p_plugin_name TEXT,
  p_max_queued INTEGER DEFAULT 2
) RETURNS UUID AS $$
DECLARE
  active_count INTEGER;
  new_id UUID;
BEGIN
  -- Serialize per-user queue operations (same pattern as project limit trigger)
  IF p_user_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext('build_queue:' || p_user_id::text));

    SELECT count(*) INTO active_count
    FROM public.build_jobs
    WHERE user_id = p_user_id AND status IN ('queued', 'running');

    IF active_count >= p_max_queued THEN
      RAISE EXCEPTION 'Queue limit exceeded: % active jobs (max %)', active_count, p_max_queued
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Validate payload size (max 512KB)
  IF octet_length(p_plugin_config::text) > 524288 THEN
    RAISE EXCEPTION 'plugin_config exceeds 512KB limit'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.build_jobs (user_id, plugin_config, plugin_name)
  VALUES (p_user_id, p_plugin_config, p_plugin_name)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

```python
@router.post("/build-jobs")
@limiter.limit("5/minute")
async def create_build_job(config: PluginConfig, request: Request):
    user_id = getattr(request.state, "user", {}).get("id") if hasattr(request.state, "user") else None

    # 1. Reserve build quota BEFORE creating the job (charge-on-success model).
    #    If user is over quota, reject immediately. Quota is refunded by the worker
    #    if the build fails (see _process_job).
    if user_id:
        user_profile = await build_job_service.get_user_profile(user_id)
        tier = user_profile.get("subscription_tier", "free")
        max_builds = TIER_LIMITS[tier]["builds_per_period"]
        quota_ok = await supabase_admin.rpc(
            "increment_build_count", {"p_user_id": user_id, "p_max_builds": max_builds}
        ).execute()
        if not quota_ok.data:
            raise HTTPException(403, "Monthly build limit reached. Upgrade your plan for more builds.")

    # 2. Atomic queue limit check + insert via DB function (prevents TOCTOU race)
    try:
        job_id = await build_job_service.enqueue_job(config, user_id)
    except CheckViolationError as e:
        # Refund quota if we can't even enqueue
        if user_id:
            await supabase_admin.rpc("decrement_build_count", {"p_user_id": user_id}).execute()
        if "Queue limit exceeded" in str(e):
            raise HTTPException(429, "You have too many builds in progress. Wait for completion.")
        raise HTTPException(400, str(e))

    build_worker.notify()  # Wake the worker
    job = await build_job_service.get_job(job_id)

    return {"job_id": str(job["id"]), "status": "queued", "created_at": job["created_at"]}
```

**GET /api/build-jobs/{id}** — On-the-fly signed URL generation (no stale URLs):

Signed URLs (Supabase Storage) expire after their TTL. Rather than storing a pre-signed URL at build time (which becomes stale), generate a fresh signed URL on each poll. This costs one extra Supabase API call per poll of a succeeded job, but avoids the stale URL problem entirely.

```python
@router.get("/build-jobs/{job_id}")
async def get_build_job(job_id: str, request: Request):
    user_id = getattr(request.state, "user", {}).get("id") if hasattr(request.state, "user") else None
    job = await build_job_service.get_job(job_id)

    if not job:
        raise HTTPException(404, "Build job not found")
    # Ownership check (skip in local dev with no auth)
    if user_id and job.get("user_id") and job["user_id"] != user_id:
        raise HTTPException(404, "Build job not found")

    result = {
        "job_id": job["id"],
        "status": job["status"],
        "error_message": job.get("error_message"),
        "jar_filename": job.get("jar_filename"),
        "artifact_size_bytes": job.get("artifact_size_bytes"),
        "created_at": job["created_at"],
        "completed_at": job.get("completed_at"),
    }

    # Generate fresh signed URL only for succeeded jobs with artifacts
    if job["status"] == "succeeded" and job.get("artifact_storage_path"):
        result["artifact_url"] = await artifact_storage.get_download_url(
            job["artifact_storage_path"]
        )

    return result
```

### Worker Architecture (in-process async, semaphore-controlled)

```python
# backend/app/services/build_worker.py

class BuildWorker:
    def __init__(self):
        self._semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_BUILDS)  # default: 1
        self._wake_event = asyncio.Event()
        self._worker_id = f"worker-{uuid.uuid4().hex[:8]}"
        self._shutdown = False

    async def start(self):
        """Called from FastAPI lifespan startup."""
        self._loop_task = asyncio.create_task(self._run_loop())
        self._recovery_task = asyncio.create_task(self._recovery_loop())
        self._cleanup_task = asyncio.create_task(self._artifact_cleanup_loop())

    async def stop(self):
        """Called from FastAPI lifespan shutdown. Waits for running jobs to finish."""
        self._shutdown = True
        self._wake_event.set()
        # Wait for main loop to exit (running jobs will complete)
        if self._loop_task:
            await self._loop_task
        # Cancel and await background tasks to prevent dangling coroutines
        for task in [self._recovery_task, self._cleanup_task]:
            if task and not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

    def notify(self):
        """Wake the worker when a new job is created."""
        self._wake_event.set()

    async def _run_loop(self):
        while not self._shutdown:
            try:
                await asyncio.wait_for(self._wake_event.wait(), timeout=10.0)
            except asyncio.TimeoutError:
                pass
            self._wake_event.clear()

            while not self._shutdown:
                await self._semaphore.acquire()
                job_id = await self._claim_job()
                if not job_id:
                    self._semaphore.release()
                    break
                asyncio.create_task(self._process_and_release(job_id))

    async def _process_and_release(self, job_id: str):
        try:
            await self._process_job(job_id)
        finally:
            self._semaphore.release()
            self.notify()  # Check for more queued jobs

    async def _process_job(self, job_id: str):
        """Process a build job with charge-on-success quota integration.

        Quota lifecycle (integrates with audit finding #26):
        1. POST /api/build-jobs — quota is RESERVED (increment_build_count) at submission time.
           If quota exceeded, 429 is returned and no job is created.
        2. Worker picks up job → generates code → builds → uploads artifact.
        3. On SUCCESS: quota stays consumed. Job marked succeeded.
        4. On FAILURE: quota is ROLLED BACK (decrement_build_count). Failed builds
           don't count against the user's limit. Job marked failed with explanation.

        Cross-period reservation policy:
        Quota is tied to the SUBMISSION period, not the execution period. If a user
        submits a job at 11:59 PM on the last day of their billing cycle and the build
        runs past midnight, the build still counts against the OLD period's quota
        (which was already reserved). This is the simplest correct behavior because:
        - increment_build_count already ran against the old period at submission time.
        - The period-reset logic in increment_build_count resets the counter when
          current_period_end < now(), so the new period starts fresh on next submission.
        - No retroactive recount is needed.
        - If the build FAILS, the decrement also targets the old period (which is correct,
          since the original reservation was there).
        Edge case: if a Stripe webhook fires mid-build and resets builds_used_this_period
        to 0 (new billing period), the decrement on failure could underflow — but
        decrement_build_count uses GREATEST(n-1, 0) to floor at zero, so this is safe.
        """
        build_dir = Path(f"/tmp/builds/{job_id}")
        heartbeat_task = None
        try:
            build_dir.mkdir(parents=True, exist_ok=True)
            await build_job_service.update_job(job_id, build_dir=str(build_dir))

            heartbeat_task = asyncio.create_task(self._heartbeat_loop(job_id))

            # 1. Load config from DB
            job = await build_job_service.get_job(job_id)
            config = PluginConfig(**job["plugin_config"])

            # 2. Generate code (sync, CPU-light — run in executor)
            loop = asyncio.get_event_loop()
            files = await loop.run_in_executor(None, code_generator.generate_all, config)

            # 3. Write files (sync I/O — run in executor)
            await loop.run_in_executor(None, file_writer.write_files, build_dir, config, files)

            # 4. Maven build — NON-BLOCKING (asyncio subprocess, not subprocess.run)
            jar_path = await self._async_maven_build(build_dir)

            # 5. Upload JAR to Supabase Storage (or local fallback)
            #    Sanitize filename — jar_path.name derives from user-influenced
            #    artifact_id + version fields. Strip path traversal and non-safe chars.
            safe_name = self._sanitize_filename(jar_path.name)
            storage_path = f"builds/{job_id}/{safe_name}"
            await artifact_storage.upload(job_id, jar_path, safe_name)

            # 6. Mark succeeded (no artifact_url stored — generated fresh on read)
            await build_job_service.update_job(job_id,
                status="succeeded",
                artifact_storage_path=storage_path,
                jar_filename=safe_name,
                artifact_size_bytes=jar_path.stat().st_size,
                artifact_expires_at=(datetime.utcnow() + timedelta(hours=settings.ARTIFACT_EXPIRY_HOURS)).isoformat(),
                completed_at=datetime.utcnow().isoformat(),
            )
        except Exception as e:
            logger.error("Build job %s failed: %s", job_id, e)
            await build_job_service.update_job(job_id,
                status="failed",
                error_message=str(e)[:1000],
                completed_at=datetime.utcnow().isoformat(),
            )
            # Charge-on-success rollback: refund quota on failure
            user_id = job.get("user_id") if 'job' in dir() else None
            if not user_id:
                # Re-fetch if job wasn't loaded yet
                try:
                    failed_job = await build_job_service.get_job(job_id)
                    user_id = failed_job.get("user_id")
                except Exception:
                    pass
            if user_id:
                try:
                    await supabase_admin.rpc("decrement_build_count", {"p_user_id": user_id}).execute()
                    logger.info("Refunded build quota for user %s (job %s failed)", user_id, job_id)
                except Exception as refund_err:
                    logger.error("Failed to refund build quota for user %s: %s", user_id, refund_err)
        finally:
            if heartbeat_task:
                heartbeat_task.cancel()
            if build_dir.exists():
                shutil.rmtree(build_dir, ignore_errors=True)

    async def _async_maven_build(self, project_dir: Path) -> Path:
        """Non-blocking Maven build using asyncio subprocess."""
        proc = await asyncio.create_subprocess_exec(
            settings.MAVEN_PATH, "clean", "package", "-DskipTests", "-q",
            cwd=str(project_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(), timeout=settings.MAX_BUILD_TIME,
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            raise BuildError(f"Maven build timed out after {settings.MAX_BUILD_TIME}s")

        if proc.returncode != 0:
            raise BuildError(f"Maven build failed: {(stderr or stdout or b'').decode()[:500]}")

        jars = list((project_dir / "target").glob("*.jar"))
        if not jars:
            raise BuildError("Build succeeded but no JAR found in target/")
        return jars[0]

    @staticmethod
    def _sanitize_filename(name: str) -> str:
        """Strip path traversal and non-safe characters from filenames.

        JAR filenames derive from user-influenced artifact_id + version.
        Allow only alphanumeric, hyphen, underscore, dot. Strip directory components.
        """
        import re
        # Take only the basename (strip any path components like ../ or /)
        name = Path(name).name
        # Replace any non-safe character with underscore
        name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
        # Prevent hidden files and ensure non-empty
        name = name.lstrip('.')
        return name or 'plugin.jar'

    async def _heartbeat_loop(self, job_id: str):
        """Update heartbeat every 30s while job is running."""
        while True:
            await asyncio.sleep(30)
            await build_job_service.update_heartbeat(job_id)

    async def _recovery_loop(self):
        """Recover stuck jobs every 60s."""
        while not self._shutdown:
            await asyncio.sleep(60)
            try:
                recovered = await build_job_service.recover_stuck_jobs()
                if recovered > 0:
                    logger.warning("Recovered %d stuck build jobs", recovered)
            except Exception as e:
                logger.error("Stuck job recovery failed: %s", e)

    async def _artifact_cleanup_loop(self):
        """Delete expired artifacts every hour."""
        while not self._shutdown:
            await asyncio.sleep(3600)
            try:
                await artifact_storage.cleanup_expired()
            except Exception as e:
                logger.error("Artifact cleanup failed: %s", e)
```

### Artifact Storage (abstraction layer)

```python
# backend/app/services/artifact_storage.py

class ArtifactStorageService:
    """Abstracts artifact storage — Supabase Storage in production, local in dev."""

    def __init__(self):
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
            self._backend = SupabaseStorageBackend()
        else:
            self._backend = LocalStorageBackend(settings.DOWNLOADS_DIR)

    async def upload(self, job_id: str, jar_path: Path, filename: str) -> str:
        return await self._backend.upload(job_id, jar_path, filename)

    async def get_download_url(self, storage_path: str) -> str:
        return await self._backend.get_download_url(storage_path)

    async def delete(self, storage_path: str) -> None:
        return await self._backend.delete(storage_path)

    async def cleanup_expired(self):
        """Delete artifacts past their expiry from storage + clear DB fields."""
        expired = await build_job_service.get_expired_artifacts()
        for job in expired:
            await self.delete(job["artifact_storage_path"])
            await build_job_service.clear_artifact(job["id"])
```

- **Supabase backend:** Uploads to `build-artifacts` bucket, generates signed URLs (24h TTL).
- **Local backend:** Copies JAR to `./downloads/<job_id>-<filename>`, serves via `FileResponse`. Periodic cleanup deletes files older than `ARTIFACT_EXPIRY_HOURS`.

### Cleanup Strategy Summary

| What | When | Trigger |
|------|------|---------|
| Temp build dir (`/tmp/builds/<id>`) | After job completes (success or fail) | `_process_job` finally block |
| Orphaned temp dirs from previous crash | Server startup | Lifespan startup hook |
| Expired artifacts (Supabase Storage or local) | 24h after creation | Hourly background task |
| Stuck jobs (no heartbeat for 5min) | Every 60s | `_recovery_loop` |
| Orphaned temp dirs for stuck jobs | When recovery marks job failed | Recovery task also rmtree's `build_dir` |

Startup cleanup:
```python
def cleanup_orphaned_build_dirs():
    """Delete any leftover /tmp/builds/* dirs from previous crashes."""
    builds_dir = Path("/tmp/builds")
    if builds_dir.exists():
        for d in builds_dir.iterdir():
            if d.is_dir():
                shutil.rmtree(d, ignore_errors=True)
                logger.info("Cleaned orphaned build dir: %s", d)
```

### FastAPI Lifespan

```python
# backend/app/main.py
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    cleanup_orphaned_build_dirs()
    recovered = await build_job_service.recover_stuck_jobs()
    if recovered:
        logger.warning("Recovered %d stuck jobs on startup", recovered)
    await build_worker.start()
    yield
    # Shutdown
    await build_worker.stop()

app = FastAPI(title="Minecraft Plugin Builder API", lifespan=lifespan)
```

### Configuration Additions (`backend/app/config.py`)

```python
# Build queue
MAX_CONCURRENT_BUILDS: int = 1      # Per-instance semaphore (see note below)
MAX_QUEUED_JOBS_PER_USER: int = 2
BUILD_JOB_TIMEOUT_MINUTES: int = 5
ARTIFACT_EXPIRY_HOURS: int = 24
```

**Important: `MAX_CONCURRENT_BUILDS` is per-instance, not cluster-wide.**
With N replicas, total concurrent builds = `MAX_CONCURRENT_BUILDS * N`. This is acceptable because:
1. The DB-side `claim_next_build_job()` with `FOR UPDATE SKIP LOCKED` guarantees each job is processed by exactly one worker — no double-processing.
2. The semaphore limits per-instance CPU/RAM pressure from Maven builds.
3. For true cluster-wide concurrency control (e.g., limiting total concurrent Maven builds to 2 across all replicas), the check must be inside the atomic claim transaction. A standalone `SELECT count(*)` without locking is race-prone — multiple workers can read the same count and all proceed. Instead, use an advisory lock around the claim:
```sql
-- Optional: cluster-wide concurrency limit (replace claim_next_build_job body)
CREATE OR REPLACE FUNCTION claim_next_build_job(
  p_worker_id TEXT,
  p_max_global INTEGER DEFAULT NULL  -- NULL = no global limit
) RETURNS UUID AS $$
DECLARE
  claimed_id UUID;
  running_count INTEGER;
BEGIN
  -- Global concurrency gate (advisory lock serializes all claim attempts cluster-wide)
  IF p_max_global IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext('build_global_claim'));
    SELECT count(*) INTO running_count
    FROM public.build_jobs WHERE status = 'running';
    IF running_count >= p_max_global THEN
      RETURN NULL;  -- At capacity, caller backs off
    END IF;
  END IF;

  UPDATE public.build_jobs
  SET status = 'running', worker_id = p_worker_id,
      started_at = now(), heartbeat_at = now(), updated_at = now()
  WHERE id = (
    SELECT id FROM public.build_jobs
    WHERE status = 'queued' ORDER BY created_at ASC
    LIMIT 1 FOR UPDATE SKIP LOCKED
  )
  RETURNING id INTO claimed_id;

  RETURN claimed_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
The advisory lock serializes all claim attempts globally, so the count check and the UPDATE are atomic. Lock auto-releases at transaction end. For v1 with a single replica, pass `p_max_global := NULL` to skip the global check and use only the per-instance semaphore.

### Frontend Polling Flow

```javascript
// frontend/src/services/api.js — new methods
async submitBuildJob(config) {
  const response = await axiosInstance.post('/build-jobs', config);
  return response.data; // { job_id, status, created_at }
},

async getBuildJobStatus(jobId) {
  const response = await axiosInstance.get(`/build-jobs/${jobId}`);
  // artifact_url is a fresh signed URL generated on each request (never stale)
  return response.data; // { job_id, status, artifact_url?, error_message?, ... }
},
```

```javascript
// frontend/src/App.jsx — handleGenerate rewrite
const handleGenerate = async () => {
  setLoading(true);
  setError(null);
  setBuildStatus('submitting');

  try {
    const result = await apiService.submitBuildJob(buildPayload());
    setBuildJobId(result.job_id);
    setBuildStatus('queued');

    // Poll until terminal state
    const POLL_INTERVAL = 2000;
    const MAX_POLLS = 90; // 3 min max
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
      const status = await apiService.getBuildJobStatus(result.job_id);
      setBuildStatus(status.status);

      if (status.status === 'succeeded') {
        setBuildArtifactUrl(status.artifact_url);
        window.open(status.artifact_url, '_blank');
        setLoading(false);
        return;
      }
      if (status.status === 'failed') {
        setError(status.error_message || 'Build failed.');
        setLoading(false);
        return;
      }
    }
    setError('Build is taking longer than expected. Check back later.');
  } catch (err) {
    setError(err.response?.data?.detail || 'Failed to submit build.');
  } finally {
    setLoading(false);
  }
};
```

UI button states: "Submitting..." → "Queued..." → "Building..." → "Download Ready" or error.

### Migration Path

| Step | What | Breaking? |
|------|------|-----------|
| 1 | Create `build_jobs` table + functions in Supabase | No |
| 2 | Create `build-artifacts` storage bucket | No |
| 3 | Add config settings, new dependencies | No |
| 4 | Create `BuildJobService`, `ArtifactStorageService`, `BuildWorker` | No |
| 5 | Create `POST /api/build-jobs` and `GET /api/build-jobs/{id}` routes | No (additive) |
| 6 | Add lifespan handler to start/stop worker | No |
| 7 | Refactor `PluginGeneratorService.generate()` to sync wrapper over job queue | No (same external behavior) |
| 8 | Update `GET /api/download/{id}` to query `build_jobs` instead of in-memory registry | No |
| 9 | Update frontend `handleGenerate` to use polling | Yes (deploy frontend + backend together) |
| 10 | Remove `_download_registry`, `./downloads/` dir usage, deprecate sync route | Cleanup |

### Files to Create or Modify

**New files:**
- `backend/app/models/build_job.py` — Request/response DTOs
- `backend/app/routes/build_jobs.py` — New API routes
- `backend/app/services/build_worker.py` — Async worker
- `backend/app/services/build_job_service.py` — CRUD for build_jobs
- `backend/app/services/artifact_storage.py` — Storage abstraction
- `backend/app/services/supabase_client.py` — Supabase client singleton

**Modified files:**
- `backend/app/config.py` — Add queue/storage settings
- `backend/app/main.py` — Add lifespan, register routes
- `backend/app/routes/plugin.py` — Update download route, deprecate generate
- `backend/app/services/plugin_generator.py` — Delegate to job queue (sync wrapper)
- `backend/requirements.txt` — Add `supabase`
- `frontend/src/services/api.js` — Add submitBuildJob, getBuildJobStatus
- `frontend/src/App.jsx` — Rewrite handleGenerate to polling

### Verification Plan (Phase 9)

26. **Happy path:** Submit build job → poll → queued → running → succeeded → download URL works.
27. **Failed build:** Submit with config that produces invalid Java → status=failed, error_message populated, temp dir cleaned.
28. **Queue limit:** Submit 3 jobs as same user → third rejected with 429.
29. **Stuck job recovery:** Set `heartbeat_at` to 10 min ago on a running job → recovery marks it failed within 60s.
30. **Concurrent claiming:** Submit 2 jobs with `MAX_CONCURRENT_BUILDS=1` → only one runs at a time, second waits.
31. **Non-blocking event loop:** During Maven build, `GET /api/build-jobs/{id}` and `GET /api/blocks` still respond instantly.
32. **Artifact expiry:** Manually set `artifact_expires_at` to past → cleanup task deletes from storage + clears DB fields.
33. **Startup recovery:** Kill server mid-build → restart → stuck job recovered → orphaned temp dir cleaned.
34. **Local dev fallback:** Without `SUPABASE_URL` set, builds use local `./downloads/` storage and `FileResponse`.
35. **Deprecated sync route:** `POST /api/generate-plugin` still works (polls internally), returns same response shape.
36. **Webhook stale pending reclaim:** Insert a `webhook_events` row with `status='pending'` and `created_at` 10 min ago → send same event again → second delivery reclaims and processes it successfully.
37. **Webhook fresh pending returns 409:** Send a webhook → immediately send duplicate → second returns 409 (not 200), Stripe will retry.
38. **build_jobs RLS isolation:** As user A, create a build job. As user B, `SELECT * FROM build_jobs` → user B cannot see user A's jobs. NULL `user_id` rows are invisible to all authenticated users.
39. **Queue cap atomicity:** Send 2 concurrent `POST /api/build-jobs` as the same user (already has 1 active job, limit=2) → exactly one succeeds, the other gets 429. Never both succeed.
40. **Build quota lifecycle:** Submit a build job (quota incremented). Build fails → poll shows `status=failed` → verify `builds_used_this_period` was decremented back (quota refunded).
41. **Fresh signed URLs:** Poll a succeeded build job twice, 5 minutes apart → both responses contain valid `artifact_url` with fresh signed URLs (not the same cached URL).
42. **Payload size rejection:** Submit a build job with >512KB `plugin_config` → rejected at DB level with check violation error, not queued.
43. **Quota RPC param correctness:** Submit a build job as a free-tier user → verify `increment_build_count` is called with both `p_user_id` and `p_max_builds=1` (free tier `buildsPerPeriod`). First build succeeds, second attempt → 403. Repeat for premium (`p_max_builds=5`) and pro (`p_max_builds=-1` = unlimited).
44. **Webhook atomic reclaim:** Insert `webhook_events` row with `status='failed'`. Send two concurrent retries → only one reclaims (CAS UPDATE succeeds), the other gets 409. Event is processed exactly once.
45. **Webhook staleness uses updated_at:** Insert `webhook_events` with `status='pending'`, `created_at=10min ago`, `updated_at=10min ago` → retry reclaims it. Then insert with `created_at=10min ago` but `updated_at=2min ago` → retry returns 409 (fresh pending per `updated_at`).
46. **Cross-period quota:** Submit a build job at 11:59 PM before billing period ends. Build completes after midnight. Verify build counted against old period. On next submission, new period starts fresh (counter was reset by `increment_build_count`). If build FAILS after midnight, `decrement_build_count` floors at 0 (no negative count).
47. **Webhook CAS with updated_at:** Two concurrent retries on a failed event → only one reclaims (CAS matches `updated_at` snapshot). Second retry sees `updated_at` changed, gets rowCount=0, returns 409.
48. **Stuck-job quota refund:** Reserve quota + submit build → kill worker mid-build → recovery loop marks job failed → verify `builds_used_this_period` was decremented (refund happened in DB function).
49. **Checkout redirect URL safety:** Verify `success_url` and `cancel_url` in Stripe checkout session use `NEXT_PUBLIC_SITE_URL` (server env var), not the request `origin` header.
50. **Filename sanitization:** Submit a build with `artifact_id` containing `../../etc/passwd` or `<script>` → resulting storage path and jar_filename use sanitized name with only `[a-zA-Z0-9._-]` chars.
51. **Multi-replica concurrency:** With 2 replicas (each `MAX_CONCURRENT_BUILDS=1`), submit 3 jobs → 2 run concurrently (one per replica), third waits. No double-processing (each job claimed exactly once via `FOR UPDATE SKIP LOCKED`).
52. **Portal return_url canonical:** Click "Manage Subscription" → Stripe portal opens → click "Return to merchant" → redirected to `NEXT_PUBLIC_SITE_URL/account` (not request origin).
53. **Stuck-job recovery count accuracy:** Manually create 3 stuck jobs (heartbeat 10min ago) → run `recover_stuck_build_jobs()` → returns 3 (not 1). All 3 jobs marked failed and quotas refunded.
54. **Graceful shutdown:** Start server with 2 active builds → send SIGTERM → verify `_loop_task` awaits running builds, then `_recovery_task` and `_cleanup_task` are cancelled cleanly (no "Task was destroyed but it is pending" warnings).
55. **NEXT_PUBLIC_SITE_URL in env:** With `NEXT_PUBLIC_SITE_URL` unset → checkout/portal routes fail with clear error (not undefined concatenation).
