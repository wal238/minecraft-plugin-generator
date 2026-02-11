#!/usr/bin/env npx tsx
/**
 * Stripe Setup Script
 *
 * Creates products and prices for MC Plugin Builder subscription tiers.
 * Run once per Stripe account (test or live).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-stripe.ts
 *
 * What it does:
 *   1. Creates "Premium" and "Pro" products (idempotent via metadata lookup)
 *   2. Creates monthly + yearly prices for each product
 *   3. Outputs the real price IDs to paste into landing/src/lib/stripe/plans.ts
 *   4. Optionally configures a Stripe customer portal with the created prices
 *
 * Safe to run multiple times — skips products that already exist (matched by metadata.tier).
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('ERROR: Set STRIPE_SECRET_KEY env var before running.\n');
  console.error('  STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-stripe.ts');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-18.acacia' as Stripe.LatestApiVersion,
});

// ── Plan definitions ──────────────────────────────────────────────────

interface PlanDef {
  tier: string;
  productName: string;
  productDescription: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
}

const PLANS: PlanDef[] = [
  {
    tier: 'premium',
    productName: 'MC Plugin Builder — Premium',
    productDescription: 'Unlimited projects, 5 builds/month, 20 events, 50 actions, no watermark.',
    monthlyPriceCents: 499,   // $4.99
    yearlyPriceCents: 4999,   // $49.99
  },
  {
    tier: 'pro',
    productName: 'MC Plugin Builder — Pro',
    productDescription: 'Unlimited everything, 20 builds/month, API access, team members.',
    monthlyPriceCents: 999,   // $9.99
    yearlyPriceCents: 9999,   // $99.99
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

async function findExistingProduct(tier: string): Promise<Stripe.Product | null> {
  // Search by metadata.tier to avoid duplicates on re-run
  const products = await stripe.products.list({ limit: 100, active: true });
  return products.data.find((p) => p.metadata.tier === tier) ?? null;
}

async function findExistingPrice(
  productId: string,
  interval: 'month' | 'year',
  unitAmount: number,
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 20,
  });
  return (
    prices.data.find(
      (p) =>
        p.recurring?.interval === interval &&
        p.unit_amount === unitAmount &&
        p.currency === 'usd',
    ) ?? null
  );
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('MC Plugin Builder — Stripe Setup\n');

  const isTest = STRIPE_SECRET_KEY!.startsWith('sk_test_');
  console.log(`Mode: ${isTest ? 'TEST' : 'LIVE'}\n`);

  const priceIds: Record<string, { monthly: string; yearly: string }> = {};

  for (const plan of PLANS) {
    console.log(`── ${plan.tier.toUpperCase()} ──`);

    // 1. Create or find product
    let product = await findExistingProduct(plan.tier);
    if (product) {
      console.log(`  Product exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: plan.productName,
        description: plan.productDescription,
        metadata: { tier: plan.tier, app: 'mc-plugin-builder' },
      });
      console.log(`  Product created: ${product.id}`);
    }

    // 2. Create or find monthly price
    let monthlyPrice = await findExistingPrice(product.id, 'month', plan.monthlyPriceCents);
    if (monthlyPrice) {
      console.log(`  Monthly price exists: ${monthlyPrice.id}`);
    } else {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: plan.monthlyPriceCents,
        recurring: { interval: 'month' },
        metadata: { tier: plan.tier, billing: 'monthly' },
      });
      console.log(`  Monthly price created: ${monthlyPrice.id}`);
    }

    // 3. Create or find yearly price
    let yearlyPrice = await findExistingPrice(product.id, 'year', plan.yearlyPriceCents);
    if (yearlyPrice) {
      console.log(`  Yearly price exists: ${yearlyPrice.id}`);
    } else {
      yearlyPrice = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: plan.yearlyPriceCents,
        recurring: { interval: 'year' },
        metadata: { tier: plan.tier, billing: 'yearly' },
      });
      console.log(`  Yearly price created: ${yearlyPrice.id}`);
    }

    priceIds[plan.tier] = {
      monthly: monthlyPrice.id,
      yearly: yearlyPrice.id,
    };

    console.log();
  }

  // 4. Configure customer portal
  console.log('── CUSTOMER PORTAL ──');
  try {
    const allPriceIds = Object.values(priceIds).flatMap((p) => [p.monthly, p.yearly]);
    const portalProducts = Object.values(priceIds).map((p) => ({
      product: '',  // filled below
      prices: [p.monthly, p.yearly],
    }));

    // Get product IDs from prices
    for (const tierPrices of Object.values(priceIds)) {
      const price = await stripe.prices.retrieve(tierPrices.monthly);
      const productId = typeof price.product === 'string' ? price.product : price.product.id;
      portalProducts.find((pp) => pp.prices.includes(tierPrices.monthly))!.product = productId;
    }

    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'MC Plugin Builder — Manage Subscription',
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price'],
          proration_behavior: 'create_prorations',
          products: portalProducts.map((pp) => ({
            product: pp.product,
            prices: pp.prices,
          })),
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
        },
        payment_method_update: {
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
      },
    });
    console.log('  Customer portal configured.\n');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  Portal config skipped (may already exist): ${message}\n`);
  }

  // 5. Auto-patch plans.ts with real price IDs
  const plansPath = new URL('../landing/src/lib/stripe/plans.ts', import.meta.url);
  const fs = await import('fs');
  const plansFile = fs.readFileSync(plansPath, 'utf-8');

  let patched = plansFile;
  patched = patched.replace(
    /stripePriceIds:\s*\['price_premium_monthly',\s*'price_premium_yearly'\]/,
    `stripePriceIds: ['${priceIds.premium.monthly}', '${priceIds.premium.yearly}']`,
  );
  patched = patched.replace(
    /stripePriceIds:\s*\['price_pro_monthly',\s*'price_pro_yearly'\]/,
    `stripePriceIds: ['${priceIds.pro.monthly}', '${priceIds.pro.yearly}']`,
  );

  if (patched !== plansFile) {
    fs.writeFileSync(plansPath, patched);
    console.log('── PLANS.TS UPDATED ──');
    console.log(`  premium: ['${priceIds.premium.monthly}', '${priceIds.premium.yearly}']`);
    console.log(`  pro:     ['${priceIds.pro.monthly}', '${priceIds.pro.yearly}']\n`);
  } else {
    // If placeholder IDs already replaced (re-run), just print the IDs
    console.log('── plans.ts already has real price IDs (no changes needed) ──\n');
  }

  // 6. Print summary
  console.log('═══════════════════════════════════════════════════');
  console.log('  SETUP COMPLETE');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('Price IDs:');
  console.log(`  Premium monthly: ${priceIds.premium.monthly}`);
  console.log(`  Premium yearly:  ${priceIds.premium.yearly}`);
  console.log(`  Pro monthly:     ${priceIds.pro.monthly}`);
  console.log(`  Pro yearly:      ${priceIds.pro.yearly}\n`);

  console.log('Env vars needed in landing/.env.local:\n');
  console.log(`  STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY!.slice(0, 12)}...`);
  console.log(`  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${isTest ? 'pk_test_...' : 'pk_live_...'}`);
  console.log(`  STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard → Webhooks)\n`);

  console.log('Webhook events to subscribe to:');
  console.log('  - checkout.session.completed');
  console.log('  - customer.subscription.updated');
  console.log('  - customer.subscription.deleted');
  console.log('  - invoice.payment_failed');
  console.log('  - invoice.paid\n');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
