-- Analytics foundation: is_admin flag on profiles + server-side event log.
-- Named app_events (not events) to avoid collision with any public-events
-- feature an app might add (meetups, calendar items, etc.).
-- The event log exists alongside a product like PostHog so we have a SQL
-- source of truth for studio-level meta-dashboards.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS app_events_user_id_idx ON public.app_events (user_id);
CREATE INDEX IF NOT EXISTS app_events_name_idx ON public.app_events (name);
CREATE INDEX IF NOT EXISTS app_events_created_at_idx ON public.app_events (created_at DESC);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_events_self_insert"
  ON public.app_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "app_events_admin_read"
  ON public.app_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE OR REPLACE VIEW public.app_events_daily AS
SELECT
  date_trunc('day', created_at) AS day,
  name,
  count(*) AS count
FROM public.app_events
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC;
