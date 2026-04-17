import Stripe from 'stripe';

// Lazy singleton so importing this module at build time (when STRIPE_SECRET_KEY
// is unset) doesn't throw. The error only fires when a route handler actually
// tries to call Stripe.
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
    typescript: true,
    appInfo: { name: 'next-template', version: '0.1.0' },
  });
  return _stripe;
}
