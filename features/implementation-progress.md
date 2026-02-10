# Implementation Progress — Landing Page + Auth + Stripe Billing

> Tracking doc for `features/landing-auth-stripe.md` implementation.
> Last updated: 2026-02-10

---

## Status Summary

| Phase | Description | Status | Notes |
|-------|-------------|--------|-------|
| **Phase 1** | Scaffold Next.js app | **DONE** | `landing/` created with TS, Tailwind, App Router |
| **Phase 2** | Database schema (Supabase) | **PARTIAL** | Profiles table + trigger provided as SQL. Remaining tables (projects, build_logs, webhook_events, build_jobs) not yet run. |
| **Phase 3** | Landing page UI (9 sections) | **NOT STARTED** | Design system + UI components built, but `page.tsx` still has default Next.js scaffold content |
| **Phase 4** | Authentication (Supabase) | **DONE** | Signup, login, callback, reset-password, update-password, proxy, hooks, account page |
| **Phase 5** | Stripe Integration | **PARTIAL** | `create-portal` route built. `create-checkout` and `webhooks/stripe` routes not yet built. |
| **Phase 6** | Backend auth & feature gating | **NOT STARTED** | JWKS JWT verification, rate limiting, tier enforcement |
| **Phase 7** | Builder app integration | **NOT STARTED** | Auth store, project persistence, feature gating UI |
| **Phase 8** | SEO hardening | **NOT STARTED** | JSON-LD, robots.txt, sitemap, security headers, metadata |
| **Phase 9** | Async build queue | **NOT STARTED** | build_jobs table, worker, artifact storage, polling API |

---

## Phase 1: Next.js Project Setup — DONE

### What was built
- Scaffolded `landing/` via `create-next-app` with TypeScript, Tailwind, ESLint, App Router, `src/` directory
- Installed dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `@stripe/stripe-js`

### Files created
| File | Purpose |
|------|---------|
| `landing/.env.local` | Local dev env vars (Supabase keys, site URLs) |
| `landing/.env.example` | Template with empty values for repo |
| `landing/next.config.ts` | Supabase image remote patterns |
| `landing/tailwind.config.ts` | Extended with `mc.*` colors, `bg.*` colors, `font-pixel`/`font-body` families |
| `landing/src/app/globals.css` | Full Minecraft design system: CSS custom properties, mc-btn variants (orange/green/blue/red/outline), mc-card, scroll reveal animations, responsive breakpoints |
| `landing/src/types/index.ts` | TypeScript types: `SubscriptionTier`, `SubscriptionStatus`, `Profile`, `Project`, `TierLimits`, `Plan` |
| `landing/src/lib/stripe/plans.ts` | `PLANS` constant (Free/Premium/Pro tiers with limits), `VALID_PRICE_IDS` set, `getTierForPriceId()` helper |
| `landing/src/lib/stripe/client.ts` | Stripe SDK init with `apiVersion: '2026-01-28.clover'` |
| `landing/src/lib/supabase/client.ts` | Browser client with cookie domain SSO (`.mcpluginbuilder.com` in prod, no domain in dev) |
| `landing/src/lib/supabase/server.ts` | Server client using `cookies()` + `createAdminClient()` with service role key |
| `landing/src/lib/csrf.ts` | `validateOrigin()` with Origin + Sec-Fetch-Site fallback |
| `landing/src/lib/idempotency.ts` | In-memory Map with 5min TTL, `acquireIdempotencyLock()` and `cacheIdempotencyResponse()` |

### Build fixes applied
1. **Stripe API version** — Updated from `2024-11-20.acacia` to `2026-01-28.clover` (matching installed package)
2. **CSS @import order** — Moved Google Fonts `@import url()` before `@import "tailwindcss"` (CSS spec)
3. **Next.js 16 proxy convention** — Renamed `middleware.ts` → `proxy.ts`, exported `proxy()` instead of `middleware()`

---

## Phase 2: Database Schema — PARTIAL

### What was done
- SQL for profiles table + RLS + auto-create trigger provided to user for manual execution in Supabase SQL Editor
- User set up Supabase cloud project and configured `.env.local` with new-style API keys (`sb_publishable_...`, `sb_secret_...`)

### What remains
- Run remaining table SQL: `projects`, `build_logs`, `webhook_events`, `build_jobs`
- Run RPC functions: `increment_build_count`, `decrement_build_count`, `enforce_project_limit`, `enforce_project_limit_on_unarchive`, `enqueue_build_job`, `claim_next_build_job`, `recover_stuck_build_jobs`
- Run indexes

---

## Phase 3: Landing Page UI — NOT STARTED

### What exists
All **UI components** are built and ready to compose into the landing page:

| Component | File | Description |
|-----------|------|-------------|
| `MinecraftButton` | `src/components/ui/MinecraftButton.tsx` | Polymorphic button (Link when href, button otherwise), 5 variants |
| `MinecraftCard` | `src/components/ui/MinecraftCard.tsx` | Card wrapper with optional `highlighted` prop |
| `Accordion` | `src/components/ui/Accordion.tsx` | Client component, single-open behavior |
| `AnimatedSection` | `src/components/ui/AnimatedSection.tsx` | IntersectionObserver scroll reveal |
| `BlockShape` | `src/components/ui/BlockShape.tsx` | Decorative colored block icon |
| `PricingToggle` | `src/components/ui/PricingToggle.tsx` | Monthly/yearly toggle switch |

The **design system** (`globals.css`) is complete with all CSS custom properties, button variants, card styles, and animations.

### What remains
Replace `landing/src/app/page.tsx` with the 9-section landing page:
1. Navbar (sticky, transparent→solid on scroll, Login/Signup or UserMenu)
2. Hero (full viewport, animated blocks, two CTAs)
3. Features Grid (3x2 grid with block icons)
4. Pricing Cards (monthly/yearly toggle, 3 tiers)
5. Feature Comparison Table
6. How It Works (4-step flow)
7. FAQ (Accordion)
8. Final CTA
9. Footer

---

## Phase 4: Authentication — DONE

### What was built

**Auth pages:**
| File | Description |
|------|-------------|
| `src/app/(auth)/login/page.tsx` | Server component, renders `<AuthForm mode="login" />`, noindex metadata |
| `src/app/(auth)/signup/page.tsx` | Server component, renders `<AuthForm mode="signup" />`, noindex metadata |
| `src/app/(auth)/callback/route.ts` | OAuth callback, exchanges code for session, handles `type=recovery` → `/update-password` |
| `src/app/(auth)/reset-password/page.tsx` | Password reset request form, sends email with `?type=recovery` redirect |
| `src/app/(auth)/update-password/page.tsx` | Server component wrapper, noindex metadata |
| `src/app/(auth)/update-password/UpdatePasswordForm.tsx` | Client form: new password + confirm, calls `supabase.auth.updateUser()` |

**Auth components:**
| File | Description |
|------|-------------|
| `src/components/auth/AuthForm.tsx` | Shared login/signup form. Signup has: Display Name (optional), Email, Password (min 8 chars), Confirm Password. Login has: Email, Password. |
| `src/components/auth/UserMenu.tsx` | Navbar dropdown with "My Account" and "Log Out" |

**Hooks:**
| File | Description |
|------|-------------|
| `src/hooks/useUser.ts` | Client hook wrapping `supabase.auth.getUser()` + `onAuthStateChange` |
| `src/hooks/useSubscription.ts` | Fetches profile, derives tier/limits/buildsUsed. Resets loading on userId change. |

**Proxy (middleware):**
| File | Description |
|------|-------------|
| `src/proxy.ts` | Supabase session refresh + /account route protection (redirect to /login) |

**Account pages:**
| File | Description |
|------|-------------|
| `src/app/account/layout.tsx` | Auth-protected wrapper, redirects to login if no user |
| `src/app/account/page.tsx` | Server component dashboard: plan info, usage stats, builds progress bar |
| `src/app/account/AccountActions.tsx` | Client component: "GO TO BUILDER" link + "MANAGE SUBSCRIPTION" button (with Idempotency-Key) |

**Root layout:**
| File | Description |
|------|-------------|
| `src/app/layout.tsx` | SEO metadata (title, description, keywords, OpenGraph, Twitter), Press Start 2P font |

### Security fixes applied to Phase 4 code
1. **Open redirect in AuthForm** — `redirect` query param validated: must start with `/` and not `//`
2. **Open redirect in callback** — `next` query param validated with same rule
3. **Stale loading in useSubscription** — `setLoading(true)` on userId change, profile reset to null when userId undefined
4. **Password recovery flow** — Callback detects `type=recovery` and redirects to `/update-password` instead of `/account`

---

## Phase 5: Stripe Integration — PARTIAL

### What was built
| File | Description |
|------|-------------|
| `src/app/api/create-portal/route.ts` | Stripe Customer Portal session creation with CSRF validation, auth check, idempotency guard, server-configured return URL |

### What remains
- `src/app/api/create-checkout/route.ts` — Stripe Checkout session creation (with price allowlist, customer get-or-create)
- `src/app/api/webhooks/stripe/route.ts` — Webhook handler (5 event types: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`)
- Wire pricing card CTAs to checkout

---

## Phases 6–9: NOT STARTED

### Phase 6: Backend Auth & Feature Gating
- `backend/app/services/auth.py` — JWKS JWT verification
- `backend/app/middleware/auth.py` — `Depends(require_auth)` dependency
- `backend/app/middleware/rate_limit.py` — Rate limiting via slowapi
- `backend/app/routes/plugin.py` — Auth + rate limit + tier enforcement
- `backend/app/config.py` — Add Supabase + auth settings
- Production boot guard in `main.py`

### Phase 7: Builder App (Vite Frontend) Integration
- `frontend/src/services/supabase.js` — Supabase client init (cookie domain SSO)
- `frontend/src/store/useAuthStore.js` — Auth state store
- `frontend/src/services/projectService.js` — CRUD with optimistic concurrency
- `frontend/src/services/api.js` — Auth header interceptor
- `frontend/src/components/UpgradePrompt.jsx` — Tier limit modal
- `frontend/src/components/ProjectList.jsx` — Project management UI
- Feature gating UI (locked blocks, build counter)

### Phase 8: SEO Hardening
- JSON-LD (SoftwareApplication, FAQPage, Organization)
- `robots.ts` + `sitemap.ts`
- Security headers in `next.config.ts`
- Canonical URLs, www redirect
- Core Web Vitals budgets

### Phase 9: Async Build Queue
- `build_jobs` table + RLS + indexes
- DB functions: `enqueue_build_job`, `claim_next_build_job`, `recover_stuck_build_jobs`
- `POST /api/build-jobs` + `GET /api/build-jobs/{id}` routes
- `BuildWorker` with asyncio subprocess, heartbeat, stuck recovery
- Supabase Storage for artifacts (local fallback for dev)
- Frontend polling UI
- Backward-compat sync wrapper on `POST /api/generate-plugin`

---

## File Tree (current state)

```
landing/src/
├── app/
│   ├── (auth)/
│   │   ├── callback/route.ts
│   │   ├── login/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── signup/page.tsx
│   │   └── update-password/
│   │       ├── UpdatePasswordForm.tsx
│   │       └── page.tsx
│   ├── account/
│   │   ├── AccountActions.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── create-portal/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                          ← Still default Next.js scaffold
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx
│   │   └── UserMenu.tsx
│   └── ui/
│       ├── Accordion.tsx
│       ├── AnimatedSection.tsx
│       ├── BlockShape.tsx
│       ├── MinecraftButton.tsx
│       ├── MinecraftCard.tsx
│       └── PricingToggle.tsx
├── hooks/
│   ├── useSubscription.ts
│   └── useUser.ts
├── lib/
│   ├── csrf.ts
│   ├── idempotency.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── plans.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── proxy.ts
└── types/
    └── index.ts
```

**Total: 31 files in `landing/src/`**

---

## Security Audit Status

**51 findings resolved across 8 audit passes** — all documented in `features/landing-auth-stripe.md` Security Audit Checklist.

Key security features implemented in code:
- Cookie domain SSO (no token in URL)
- Open redirect prevention (AuthForm + callback)
- CSRF origin validation with Sec-Fetch-Site fallback
- Idempotency-Key duplicate-click prevention
- RLS column protection (IS NOT DISTINCT FROM for NULL-safe comparison)
- noindex metadata on all auth pages
- Server-configured redirect URLs (not request origin)
- Password min 8 chars + confirm field on signup

---

## Supabase Configuration

### Done
- Supabase cloud project created
- API keys configured in `.env.local` (new `sb_publishable_...` / `sb_secret_...` format)
- Auth redirect URL configured: `http://localhost:3000/callback`

### Required before testing auth
- Run profiles table SQL + trigger in SQL Editor (provided in Phase 2)
- Set Site URL to `http://localhost:3000` in Authentication → URL Configuration
