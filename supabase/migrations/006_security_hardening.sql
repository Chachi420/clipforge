-- 006: security hardening — close the money-path RLS gaps found in the
-- Oct 12 2026 audit (P0/P1). Idempotent: safe to re-run.
--
-- Deliberate decisions (see audit):
--  * clip_metric_snapshots: RLS ON. SELECT for clip owners AND for brands
--    owning the clip's campaign (brand dashboards read snapshots with the
--    brand's own session). NO insert/update/delete policies — only the
--    service role (cron) can write. This closes the payout-fraud vector.
--  * payout_cycles: RLS ON. Narrow SELECT for participants (cycles the caller
--    has a payout row in — keeps the clipper Payments page working, which
--    joins payout_cycles with the clipper's session). NO write policies —
--    service role only (admin panel uses the service client).
--  * campaigns: brands may INSERT only with status='pending' (approval queue).
--    Status transitions and post-approval payout-term rewrites are enforced
--    by trigger trg_campaign_transition_rules, because RLS WITH CHECK cannot
--    compare OLD vs NEW. Legit brand flows preserved: pause/resume
--    (active<->paused), editing pending briefs, editing live settings except
--    rate_per_100k. Admin approval runs on the service role (auth.uid() IS
--    NULL) and bypasses the trigger.
--  * clips: brands gain SELECT on clips of their own campaigns (dashboard was
--    data-blind). Clipper emails are intentionally NOT exposed to brands.
--  * Public clipper profiles: deliberately NOT opened. profiles has no
--    column-level RLS, so a row policy on public_profile=true would expose
--    the emails of opted-in users. Needs a column-restricted view + app
--    rewire (follow-up).

-- ---------- 1. metric snapshots: RLS on, owner+brand reads, service-role writes ----------
alter table clip_metric_snapshots enable row level security;

drop policy if exists "clip owners read own snapshots" on clip_metric_snapshots;
create policy "clip owners read own snapshots" on clip_metric_snapshots
  for select using (
    clip_id in (select id from clips where user_id = auth.uid())
  );

drop policy if exists "brands read campaign snapshots" on clip_metric_snapshots;
create policy "brands read campaign snapshots" on clip_metric_snapshots
  for select using (
    clip_id in (
      select c.id
      from clips c
      join campaigns ca on ca.id = c.campaign_id
      join brands b on b.id = ca.brand_id
      where b.owner_id = auth.uid()
    )
  );
-- NOTE: no insert/update/delete policies — writes are service-role only (cron).

-- ---------- 2. payout cycles: RLS on, participant reads, service-role writes ----------
alter table payout_cycles enable row level security;

drop policy if exists "participants read own cycles" on payout_cycles;
create policy "participants read own cycles" on payout_cycles
  for select using (
    id in (select cycle_id from payouts where user_id = auth.uid())
  );
-- NOTE: no insert/update/delete policies — writes are service-role only (admin).

-- ---------- 3. campaign insert: pending only (approval queue) ----------
drop policy if exists "brand owners insert campaigns" on campaigns;
create policy "brand owners insert campaigns" on campaigns
  for insert with check (
    brand_id in (select id from brands where owner_id = auth.uid())
    and status = 'pending'
  );

-- ---------- 4. campaign update guard: block self-activation + post-approval term rewrites ----------
create or replace function enforce_campaign_transition_rules()
returns trigger language plpgsql as $$
begin
  -- Service-role / admin paths carry no JWT (auth.uid() IS NULL) and bypass
  -- these checks; RLS still gates which rows each role can touch.
  if auth.uid() is null then
    return new;
  end if;
  -- Brands may never self-activate: pending -> active is the admin approval path.
  if old.status = 'pending' and new.status <> 'pending' then
    raise exception 'Only admins can move a campaign out of pending review';
  end if;
  -- Payout terms lock once the campaign leaves pending review.
  if old.status <> 'pending'
     and new.rate_per_100k is distinct from old.rate_per_100k then
    raise exception 'rate_per_100k cannot be changed after campaign approval';
  end if;
  return new;
end $$;

drop trigger if exists trg_campaign_transition_rules on campaigns;
create trigger trg_campaign_transition_rules
  before update on campaigns
  for each row execute function enforce_campaign_transition_rules();

-- ---------- 5. brand-scoped clip reads (dashboard was data-blind) ----------
drop policy if exists "brands read campaign clips" on clips;
create policy "brands read campaign clips" on clips
  for select using (
    campaign_id in (
      select c.id from campaigns c
      join brands b on b.id = c.brand_id
      where b.owner_id = auth.uid()
    )
  );
