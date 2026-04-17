import Stripe from 'stripe';

// Lazy singleton — constructing Stripe eagerly at module load breaks Next's
// build-time page-data collection when STRIPE_SECRET_KEY is unset. Route
// handlers call getStripe() so the env var is only required at request time.

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to .env.local before calling Stripe routes.'
    );
  }
  _stripe = new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
    appInfo: {
      name: 'next-template',
      version: '0.1.0',
    },
  });
  return _stripe;
}

// Back-compat alias: `stripe` reads like a singleton. It's a Proxy that
// defers construction until first access, so importing this module never
// triggers the missing-env-var throw.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const s = getStripe();
    const value = (s as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(s) : value;
  },
});
