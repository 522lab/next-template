-- Idempotent Stripe webhook event log.
-- event.id is Stripe's primary key — using it as our PK means replays upsert cleanly.
-- Admins can read for debugging; writes only via service role (bypasses RLS).

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS stripe_events_type_idx ON public.stripe_events (type);
CREATE INDEX IF NOT EXISTS stripe_events_received_at_idx ON public.stripe_events (received_at DESC);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_events_admin_read"
  ON public.stripe_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
