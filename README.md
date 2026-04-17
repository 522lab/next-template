# next-template

Production-ready **Next.js 15 PWA** starter for venture studio projects. Web-first by default; Expo reserved for ventures that earn native.

## Stack

- **Next.js 15** (App Router, React 19, Turbopack dev, TypeScript strict)
- **Supabase** — Postgres + Auth + Storage, via `@supabase/ssr`
- **Tailwind CSS** + **shadcn/ui** (new-york, neutral, CSS vars)
- **TanStack Query** — client-side data fetching / caching
- **PostHog** — product analytics (plus SQL event log in `app_events`)
- **Stripe** — subscriptions via Checkout + webhook
- **PWA** — dynamic manifest, service worker, installable

## Env vars

Copy `.env.example` to `.env.local` and fill in:

| Var | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Never expose to the browser |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | If unset, analytics still logs to `app_events` |
| `NEXT_PUBLIC_POSTHOG_HOST` | optional | Defaults to `https://us.i.posthog.com` |
| `STRIPE_PUBLISHABLE_KEY` | for checkout | Public key |
| `STRIPE_SECRET_KEY` | for checkout | Server only |
| `STRIPE_WEBHOOK_SECRET` | for webhooks | From `stripe listen` or dashboard |

## Scripts

```bash
npm run dev        # Turbopack dev server on :3000
npm run build      # Production build (also type-checks)
npm run start      # Serve the production build
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # next lint
```

## Getting started

```bash
npm install
cp .env.example .env.local  # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding shadcn/ui components

Pre-installed: `button`, `card`, `input`, `label`, `dialog`, `form`, `skeleton`.

Add more on demand:

```bash
npx shadcn@latest add <component>   # e.g. table, tabs, toast, sheet
```

Components land in `components/ui/` and are yours to edit.

## Supabase setup

Run the migrations in order:

```bash
supabase db push   # or paste the SQL into Supabase Studio
```

Migrations in `supabase/migrations/`:

1. `00000000_000001_profiles.sql` — profiles table + RLS + auth trigger
2. `00000000_000002_analytics.sql` — `app_events` table + `app_events_daily` view

### Become an admin

After you sign in at `/login`, grant yourself admin access:

```sql
UPDATE profiles SET is_admin = true WHERE id = '<your-uuid>';
```

Then `/admin` becomes reachable (gated by `app/admin/layout.tsx`).

## Stripe

1. Register a product in the Stripe dashboard, then a **recurring price**. Copy its `price_id` (`price_...`).
2. Post to `/api/stripe/checkout` with `{ "price_id": "price_..." }`. Response: `{ "url": "..." }` — redirect there.
3. **Local webhook forwarding** (so your webhook handler runs on test purchases):

   ```bash
   # in one terminal — dev server
   npm run dev

   # in another — forward events to localhost
   doppler run -- ./scripts/stripe-listen.sh
   # or, if not using Doppler:
   source .env.local && ./scripts/stripe-listen.sh
   ```

   The script reads `STRIPE_SECRET_KEY` and runs `stripe listen` without the interactive `stripe login` pairing. It prints a `whsec_*` — copy it into Doppler (or `.env.local`) as `STRIPE_WEBHOOK_SECRET`, then restart the dev server.

4. **Trigger a test event:**

   ```bash
   stripe trigger checkout.session.completed
   ```

   Your webhook will fire, verify the signature, and upsert into `stripe_events`.

5. **In production**, register a real endpoint at `https://<your-domain>/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Stripe gives you the production `whsec_*` there.

## PWA icons

Drop three PNGs into `public/manifest-assets/`:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-maskable-512.png` (512×512, maskable, keep content inside the inner 80% circle)

See `public/manifest-assets/README.md` for details. The dynamic manifest at `app/manifest.ts` already references these paths.

## Project layout

```
app/
  (auth)/login/       magic-link login
  admin/              is_admin-gated dashboard
  api/stripe/         checkout + webhook routes
  manifest.ts         PWA manifest
  layout.tsx          root layout + Providers
components/
  providers.tsx       QueryClient + PostHog + SW registration
  ui/                 shadcn components
lib/
  supabase/           browser + server + middleware helpers
  analytics.ts        track / identify / reset
  stripe.ts           Stripe singleton
  utils.ts            cn()
middleware.ts         refreshes Supabase session on every request
public/
  manifest-assets/    PWA icons (drop your own)
  sw.js               minimal service worker
supabase/
  migrations/         profiles + app_events
```
