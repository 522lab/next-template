import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Idempotent insert. Stripe retries any event that doesn't 2xx within a timeout,
  // so the same event.id can arrive multiple times. The PK + ignoreDuplicates
  // make replays a no-op.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error } = await getSupabaseAdmin()
      .from('stripe_events')
      .upsert(
        {
          id: event.id,
          type: event.type,
          payload: event as unknown as Record<string, unknown>,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    if (error) {
      // Don't fail the webhook on a DB glitch — Stripe will retry if we 5xx,
      // but we've already verified the signature. Logging lets ops catch the gap.
      console.error('[stripe] failed to persist event', event.id, error.message);
    }
  }

  // Add type-specific side effects below as ventures grow. Keep them idempotent —
  // the same event may arrive twice.
  //
  // switch (event.type) {
  //   case 'checkout.session.completed': { ... }
  //   case 'customer.subscription.updated': { ... }
  // }

  return NextResponse.json({ received: true });
}
