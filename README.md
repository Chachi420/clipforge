# ClipForge

A clipping-network marketplace (inspired by clipping.net's product teardown): brands run
pay-per-view clipping campaigns, independent clippers cut short-form clips, post them on
their own social accounts, and earn per verified view.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + RLS). Schema in `supabase/migrations/001_init.sql`, demo seed in `supabase/seed.sql`.
- **Auth:** Google + Microsoft (Azure) OAuth via Supabase Auth.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase env vars the app runs in **demo mode** against a built-in dataset
(`lib/mock.ts`), so every page renders immediately. To go live:

1. Create a Supabase project, run `supabase/migrations/001_init.sql` then `supabase/seed.sql`
   (or `supabase db push`).
2. Enable the Google and Azure providers in Supabase Auth and add redirect URLs:
   `http://localhost:3000/auth/callback` and your production `/auth/callback`.
3. Copy `.env.example` to `.env.local` and fill in the keys. The data layer
   (`lib/db.ts`) switches to Supabase automatically.

## Product map (from the teardown)

| Route | Screen |
|---|---|
| `/` | Marketing landing (two-sided positioning) |
| `/login` | Clipper sign-in (Google / Microsoft) |
| `/dashboard` | Home — active / recommended / past campaigns |
| `/dashboard/campaigns` | Campaign marketplace + filters, Rules & How-it-works dialogs |
| `/dashboard/campaigns/[slug]` | Campaign detail: info, bounties, payout cycles, clips, upload dialog |
| `/dashboard/clips` | Clip library + aggregate stats, clip detail dialog |
| `/dashboard/payments` | Estimates, payment methods, payout history, payout receipts |
| `/dashboard/teams` | Referral teams & commissions |
| `/dashboard/accounts` | Connected social accounts (verified / pending) |
| `/dashboard/settings` | Profile, public toggle, account info, activity heatmap |

## Core mechanics

- **Rates** are per 100K views with per-platform overrides; two payout modes: flat
  **payrate** vs **pot-style** proportional split.
- **Bounties**: per-streamer incentive rates with requirements and budget progress.
- **View tracking**: rescanned ~every 12h per clip; bot-cleanup adjustments supported
  via append-only `clip_metric_snapshots`.
- **Payout lifecycle**: `live` → `pending_review` → `awaiting_mark_paid` (admin) → `paid`.
- **Qualification**: per-post and total minimum-view thresholds; posts must stay public
  until payment.

## Still to build (backend workers)

1. View-tracking worker (platform APIs, 12h cadence, fraud heuristics).
2. Cycle engine (close cycles → snapshot → compute estimates).
3. Admin "Mark Paid" queue + PayPal / crypto payout execution.
4. Brand-side dashboard (campaign creation, analytics, clipper applications).

See `../clipping-rebuild/RESEARCH_NOTES.md` (workspace) for the full teardown.
