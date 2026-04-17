#!/usr/bin/env bash
# Forward Stripe webhooks to the local Next dev server.
#
# Reads STRIPE_SECRET_KEY from the environment (export it, source .env.local,
# or run via `doppler run -- scripts/stripe-listen.sh`). Skips the interactive
# `stripe login` pairing flow entirely by passing --api-key.
#
# The first line of output prints a whsec_* signing secret — paste it back
# into Doppler (or .env.local) as STRIPE_WEBHOOK_SECRET, restart `npm run dev`,
# then trigger events with `stripe trigger checkout.session.completed`.

set -e

if [ -z "$STRIPE_SECRET_KEY" ] && [ -f ".env.local" ]; then
  # shellcheck disable=SC2046
  export $(grep -E '^STRIPE_SECRET_KEY=' .env.local | xargs) 2>/dev/null || true
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "ERROR: STRIPE_SECRET_KEY is not set." >&2
  echo "  Either export it, source .env.local, or run via 'doppler run'." >&2
  exit 1
fi

if ! command -v stripe >/dev/null 2>&1; then
  echo "ERROR: stripe CLI not found on PATH." >&2
  echo "  Install: https://stripe.com/docs/stripe-cli#install" >&2
  exit 1
fi

PORT="${PORT:-3000}"
FORWARD_URL="http://localhost:${PORT}/api/stripe/webhook"

echo "Forwarding Stripe webhooks → $FORWARD_URL"
echo "Copy the 'webhook signing secret' (whsec_*) below into Doppler as STRIPE_WEBHOOK_SECRET."
echo

exec stripe listen \
  --api-key "$STRIPE_SECRET_KEY" \
  --forward-to "$FORWARD_URL"
