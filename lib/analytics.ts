// Web analytics wrapper. Mirrors the API of expo-template/lib/analytics.ts so
// code can move between stacks without churn. track() fires both PostHog
// (if initialized) AND inserts into Supabase app_events for a SQL source of
// truth. Analytics must never break user flows — everything is try/catch.

import posthog from 'posthog-js';
import { createClient } from '@/lib/supabase/client';

export type EventProps = Record<
  string,
  string | number | boolean | null | undefined
>;

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
  if (!key) return;
  try {
    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      persistence: 'localStorage+cookie',
    });
    initialized = true;
  } catch {
    // never break the app because analytics failed
  }
}

export function identify(userId: string, props?: EventProps) {
  try {
    if (initialized) posthog.identify(userId, props as Record<string, unknown>);
  } catch {
    // swallow
  }
}

export function resetAnalytics() {
  try {
    if (initialized) posthog.reset();
  } catch {
    // swallow
  }
}

export function track(event: string, props?: EventProps) {
  try {
    if (initialized) posthog.capture(event, props as Record<string, unknown>);
  } catch {
    // swallow
  }
  void logEventToSupabase(event, props);
}

async function logEventToSupabase(event: string, props?: EventProps) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('app_events').insert({
      user_id: user?.id ?? null,
      name: event,
      props: (props ?? {}) as Record<string, unknown>,
    });
  } catch {
    // analytics must never break user flows
  }
}
