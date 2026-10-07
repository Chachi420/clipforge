# ClipForge — Complete Build Plan

**Goal:** a production clipping marketplace (clipper side + brand side + automation),
modelled on the clipping.net teardown in `../clipping-rebuild/RESEARCH_NOTES.md`.

**Status — DONE**
- [x] Full read-only teardown of clipping.net (clipper dashboard)
- [x] GitHub repo `Chachi420/clipforge` (public)
- [x] Clipper frontend: 13 routes, production build clean, all pages 200
- [x] Supabase schema: 13 tables + RLS + seed (`supabase/migrations/001_init.sql`)
- [x] Vercel project linked to GitHub (auto-deploy on push to `main`), public URL live

---

## Phase 1 — Backend goes live (Supabase)

**Goal:** replace demo data with a real database + real Discord login.

1. **Create Supabase project** (free tier). *Need from you: you create it, or I guide you — it takes 2 minutes.*
2. **Run the migration + seed.** Paste `supabase/migrations/001_init.sql` then `supabase/seed.sql`
   into the Supabase SQL editor (in that order).
3. **Enable Discord OAuth.** Supabase Dashboard → Auth → Providers → Discord ON.
   Create the Discord app at discord.com/developers (Client ID + Secret go into Supabase),
   set redirect URL to `https://<your-vercel-domain>/auth/callback`.
4. **Set Vercel env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Production + Preview). Redeploy.
5. **First-login profile trigger.** Add a Postgres trigger: on `auth.users` insert with a
   Discord identity, auto-create a `profiles` row (discord_id, username, avatar).
6. **Verify RLS.** Log in as clipper → confirm you only see your own clips/payouts;
   campaigns/bounties remain publicly readable.
7. **Flip the data layer.** `lib/db.ts` already switches automatically when env vars exist.
   Click through every page and confirm real (empty) states render.

*Acceptance:* Discord login works end-to-end; new user gets a profile row; dashboard
loads with zero demo data; no RLS leaks (test with two accounts).

*Need from you:* Supabase project + Discord developer app credentials.

---

## Phase 2 — Brand-side product (designed from clipping.net's public pages)

**Goal:** brands can sign up, fund campaigns, and manage them. This half was never toured
(clipping.net gates it behind a separate login), so it's designed from their marketing
pages + the clipper-side data model.

### 2a. Brand auth
- `/brand/login`: email + password (Supabase Auth email provider) + "access code" alternative,
  mirroring clipping.net's Client Access page.
- Separate session/role: `profiles.role` = `clipper | brand | admin`. Middleware routes
  brands to `/brand/*`, clippers to `/dashboard/*`.

### 2b. Brand dashboard IA
| Route | Screen |
|---|---|
| `/brand` | Overview: spend, verified views, active campaigns, budget burn |
| `/brand/campaigns` | Campaign list (draft / active / paused / ended) |
| `/brand/campaigns/new` | **Creation wizard** (below) |
| `/brand/campaigns/[slug]` | Manage: edit rates, bounties, budget, pause/resume, footage brief |
| `/brand/campaigns/[slug]/clippers` | Clipper applications (private campaigns), top clippers |
| `/brand/campaigns/[slug]/clips` | All submitted clips, fraud flags |
| `/brand/payouts` | **Review queue**: cycles awaiting Mark Paid → approve/reject per clipper |
| `/brand/analytics` | Views over time, top clips, top clippers, engagement, budget burn |
| `/brand/billing` | Add funds (Stripe), transactions, invoices |
| `/brand/settings` | Brand profile, team members, notification prefs |

### 2c. Campaign creation wizard (5 steps)
1. **Basics** — name, category, platforms, campaign type (per-view / bounty / pot), private or public.
2. **Rates** — global $/100K + per-platform overrides; min views per post + total.
3. **Bounties** — per-streamer rows: name, rate, requirements, budget cap.
4. **Budget & schedule** — budget cap, duration mode (deadline date vs until-budget-spent),
   payout method offered to clippers (PayPal / USDT / USDC).
5. **Rules & brief** — source footage links, do/don't list, review → Launch (draft → active).

### 2d. Schema additions
- `profiles.role`, `brands` (id, owner_id, name, logo, billing_email),
  `campaigns.brand_id`, `funding_transactions` (brand_id, amount, stripe_payment_id, status),
  `clipper_applications` (campaign_id, user_id, status, note),
  `payout_reviews` (payout_id, reviewer_id, decision, reason, decided_at).

*Acceptance:* a brand can sign up → create a campaign via wizard → see it in the clipper
marketplace → receive clip submissions → review and Mark Paid a cycle.

*Need from you:* nothing yet — I'll design it; you'll review the wizard flow before I build.

---

## Phase 3 — Automation workers (the real backend)

**Goal:** no manual view-counting. Everything clipping.net does on a schedule.

### 3a. View-tracking worker
- Runs every ~12h per active clip (Supabase Edge Function + pg_cron, or a small Fly.io/Render worker).
- Per platform: resolve post URL → fetch views/likes/comments.
  - Start with **oEmbed + public endpoints**; graduate to official APIs
    (YouTube Data API, TikTok Research API) as quota allows.
- Append-only writes to `clip_metric_snapshots`. Never overwrite history.
- Detect **drops** between scans → flag as possible bot-cleanup (matches the
  "sudden drops may occur due to bot protection cleanups" behavior).

### 3b. Fraud & eligibility engine
- Heuristics: view-velocity spikes, engagement-ratio outliers, new/low-trust accounts
  spiking, duplicate post URLs, hidden metrics.
- Verdicts feed `clips.tracking_status` (`tracking` / `flagged`) and surface in the
  brand's clip review screen. False-positive-safe: flag, don't auto-ban.

### 3c. Cycle engine
- Close cycles by **deadline date** or **budget exhaustion**.
- Snapshot views at close → compute per-clipper estimates:
  - *Payrate mode:* `rate/100K × qualifying views` (respect per-post + total minimums).
  - *Pot mode:* proportional share of the pot by view share.
- Set cycle → `pending_review`, notify brand.

### 3d. Payout execution
- Brand clicks **Mark Paid** (per cycle or per clipper) → generate receipt →
  execute payment:
  - **PayPal:** PayPal Payouts API (needs PayPal Business).
  - **Crypto:** USDT/USDC on Ethereum via a managed rail (Coinbase Commerce / BitPay)
    — self-custody signing is a later optimization, not MVP.
- Payout → `paid`; receipt PDF stored (Supabase Storage).

### 3e. Notifications
- Supabase Realtime / edge function → in-app bell (already UI-built) + email
  (Resend) for: cycle closed, payout approved, payout sent, fraud flag on your clip.

*Acceptance:* submit a clip URL → views accrue automatically → cycle closes →
estimate appears → brand marks paid → money moves → receipt generated. Zero spreadsheets.

*Need from you:* PayPal Business account (when we reach 3d); choice of crypto rail;
  platform API keys as we graduate from oEmbed.

---

## Phase 4 — Trust, safety & compliance

1. **Content & account checks:** duplicate-post detection (perceptual hash or URL+account),
   public-post verification before payout, audience-requirement attestation flow.
2. **Moderation queue** for brands: approve/reject clips with reasons; rejections feed the
   clipper's notification + appeal note.
3. **Rate limiting & abuse:** per-IP/account submission caps, upload throttling,
   Discord OAuth replay protection.
4. **Legal:** Terms of Service, Privacy Policy, Clipper Agreement (pay-per-view terms,
   8 rules from the teardown as the base). *Need from you: a legal template review
   before handling real money — this is non-negotiable human territory.*
5. **Money compliance:** KYC thresholds per jurisdiction, 1099-style reporting notes for
   US clippers, payout minimums (e.g. $10–$25) to keep fees sane.

---

## Phase 5 — Growth & engagement

1. **Teams v1:** referral codes, team dashboard, commission engine
   (`commission_ledger`: team_id, user_id, cycle_id, amount, status).
2. **Leaderboards:** top clippers per campaign / global (weekly, all-time).
3. **Public clipper profiles** (the toggle already exists in Settings).
4. **Private campaign applications** flow (Apply → brand approves → clipper joins).
5. **Clipper onboarding checklist:** connect account → verify → add payout method →
   join first campaign (gamified, drives activation).

---

## Phase 6 — Hardening & launch

1. **Security pass:** RLS re-audit with two test accounts, OAuth state/nonce review,
   webhook signature verification, env hygiene (no secrets in client bundle).
2. **Observability:** Sentry (errors), PostHog or Vercel Analytics (product),
   worker health checks + alerts.
3. **Performance:** pagination everywhere (already 20/page), snapshot table partitioning
   once clips scale, image/CDN hygiene.
4. **Launch checklist:** custom domain + SSL, SEO basics, status page, support inbox,
   clipper + brand onboarding docs, 2–3 pilot brands (your prospect list!), payout dry-run
   with $1 test cycles.
5. **Pricing the platform cut:** decide take-rate (e.g. 10–20% of brand spend or
   spread on the per-view rate) and encode it in the cycle engine.

---

## Cost estimate (monthly, at start)

| Item | Cost |
|---|---|
| Vercel (Hobby) | $0 |
| Supabase (Free tier → Pro when needed) | $0 → $25 |
| Domain | ~$12/yr |
| Resend (email) | $0 (free tier) |
| Worker host (Fly.io/Render) | $0–$7 |
| PayPal / crypto rail fees | per-transaction |
| **Total to start** | **≈ $0–$10/mo** |

Well inside your $300–500 starting budget, with headroom.

## Open decisions (for you, not blockers yet)

1. **Platform take-rate:** % of brand spend, or spread on the per-view rate?
2. **Crypto custody:** managed rail (simpler, fees) vs self-custody later (complex, cheaper)?
3. **Brand acquisition:** is this the "second business" that your prospect list feeds,
   or a standalone product play?
4. **Name/branding:** keep ClipForge, or rename before launch?

## Suggested build order (next actions)

1. ✅ (done) Clipper frontend + schema + deploy
2. **Phase 1** — Supabase live + Discord login (smallest step to "real")
3. **Phase 2** — Brand dashboard + creation wizard + Mark Paid queue
4. **Phase 3a–3c** — tracking worker + cycle engine (product becomes self-running)
5. **Phase 3d** — real money movement (needs PayPal Business + legal review)
6. **Phases 4–6** — trust, growth, launch
