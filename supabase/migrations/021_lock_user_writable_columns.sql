-- 021: lock user-writable columns (security audit 2026-11-27).
--
-- Several tables used one "for all using (owner = auth.uid())" policy. That
-- lets a signed-in user call the Supabase REST API directly with their own
-- session and rewrite ANY column of their own rows, skipping every check in
-- the server actions. Concretely:
--   * clips: insert straight as 'tracking' (default!) to skip review, or swap
--     post_url to someone else's viral video after approval -> paid for it.
--   * social_accounts: set verified=true / follower_count / platform_user_id
--     themselves -> bypass bio-code verification and authorship checks.
--   * campaign_members: join any campaign -> bypass eligibility/invites.
--   * brands: un-suspend themselves; campaigns: zero the platform fee,
--     restart ended campaigns; bounties: cut rates on live campaigns.
--   * brand_requests: mark their own request 'approved'.
--
-- Rule of thumb after this migration: users may only write the columns the
-- app's own forms write. Everything that moves money or trust (verification,
-- review status, fees, suspensions) is service-role only. The service role
-- (server actions using SUPABASE_SERVICE_ROLE_KEY, cron, admin) carries no
-- JWT, so auth.uid() IS NULL there and the triggers below let it through.
--
-- Requires migrations 001-020. Idempotent: safe to re-run in the SQL editor.

-- Guard: 020 may not be applied everywhere yet; the triggers reference it.
alter table campaigns add column if not exists platform_take_rate numeric default 0.2;

-- =========================================================================
-- 1. clips
-- =========================================================================
alter table clips alter column tracking_status set default 'pending_review';

drop policy if exists "own clips" on clips;
drop policy if exists "own clips select" on clips;
drop policy if exists "own clips insert" on clips;
drop policy if exists "own clips delete" on clips;

create policy "own clips select" on clips
  for select using (user_id = auth.uid());

-- Inserts only as a fresh, unreviewed, unpaid clip on an active campaign the
-- clipper has joined. (uploadClips does the authorship checks before this.)
create policy "own clips insert" on clips
  for insert with check (
    user_id = auth.uid()
    and tracking_status = 'pending_review'
    and coalesce(payout, 0) = 0
    and reviewed_by is null
    and reviewed_at is null
    and review_note is null
    and post_url ~* '^https?://'
    and campaign_id in (select campaign_id from campaign_members where user_id = auth.uid())
    and campaign_id in (select id from campaigns where status = 'active')
    and (bounty_id is null
         or bounty_id in (select b.id from bounties b where b.campaign_id = clips.campaign_id))
  );

-- Clippers may delete only clips that never earned anything.
create policy "own clips delete" on clips
  for delete using (
    user_id = auth.uid()
    and tracking_status in ('pending_review', 'not_tracking')
  );
-- NOTE: no UPDATE policy. post_url, tracking_status, payout and review fields
-- change only through the service role (admin review, cron).

-- =========================================================================
-- 2. social_accounts
-- =========================================================================
drop policy if exists "own social accounts" on social_accounts;
drop policy if exists "own social accounts select" on social_accounts;
drop policy if exists "own social accounts insert" on social_accounts;
drop policy if exists "own social accounts update" on social_accounts;
drop policy if exists "own social accounts delete" on social_accounts;

create policy "own social accounts select" on social_accounts
  for select using (user_id = auth.uid());

create policy "own social accounts insert" on social_accounts
  for insert with check (
    user_id = auth.uid()
    and verified = false
    and verified_at is null
    and follower_count = 0
    and platform_user_id is null
  );

-- Update is allowed for re-issuing a verification code; the trigger below
-- blocks every verification/trust column.
create policy "own social accounts update" on social_accounts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own social accounts delete" on social_accounts
  for delete using (user_id = auth.uid());

create or replace function social_accounts_lock_verification()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then
    return new;  -- service role: verification bot, admin
  end if;
  if new.verified is distinct from old.verified
     or new.verified_at is distinct from old.verified_at
     or new.follower_count is distinct from old.follower_count
     or new.platform_user_id is distinct from old.platform_user_id then
    raise exception 'social account verification fields cannot be changed via the API';
  end if;
  if new.user_id is distinct from old.user_id then
    raise exception 'social_accounts.user_id cannot be changed';
  end if;
  -- A verified account keeps its identity: no renaming it into another handle.
  if old.verified and (new.handle is distinct from old.handle
                       or new.platform is distinct from old.platform) then
    raise exception 'a verified account cannot change platform or handle';
  end if;
  return new;
end $$;

drop trigger if exists trg_social_accounts_lock_verification on social_accounts;
create trigger trg_social_accounts_lock_verification
  before update on social_accounts
  for each row execute function social_accounts_lock_verification();

-- =========================================================================
-- 3. campaign membership, joins, invites
-- =========================================================================
-- Joining goes through the eligibility check in lib/eligibility.ts, which
-- now writes with the service role. Clippers can read and leave only.
drop policy if exists "own memberships" on campaign_members;
drop policy if exists "own memberships select" on campaign_members;
drop policy if exists "own memberships delete" on campaign_members;
create policy "own memberships select" on campaign_members
  for select using (user_id = auth.uid());
create policy "own memberships delete" on campaign_members
  for delete using (user_id = auth.uid());

drop policy if exists "own joins" on campaign_joins;
drop policy if exists "own joins select" on campaign_joins;
create policy "own joins select" on campaign_joins
  for select using (clipper_id = auth.uid());

-- Clippers could revive expired/revoked invites; acceptance is now server-side.
drop policy if exists "own invites update" on campaign_invites;

-- =========================================================================
-- 4. campaigns
-- =========================================================================
-- Pending briefs (and their negotiated fee) are no longer public.
drop policy if exists "campaigns are publicly readable" on campaigns;
drop policy if exists "approved campaigns are publicly readable" on campaigns;
drop policy if exists "brand owners read own campaigns" on campaigns;
create policy "approved campaigns are publicly readable" on campaigns
  for select using (status <> 'pending');
create policy "brand owners read own campaigns" on campaigns
  for select using (brand_id in (select id from brands where owner_id = auth.uid()));

-- Brands can't pick their own fee or reviewer on insert.
create or replace function campaigns_insert_defaults()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  new.platform_take_rate := 0.2;
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.status := 'pending';
  return new;
end $$;

drop trigger if exists trg_campaigns_insert_defaults on campaigns;
create trigger trg_campaigns_insert_defaults
  before insert on campaigns
  for each row execute function campaigns_insert_defaults();

-- Replaces 006's version: same rules, plus fee/reviewer/brand locks, only
-- active<->paused transitions, no resuming while suspended or out of days,
-- and post-approval view minimums may only go DOWN (raising them would cut
-- what clippers already earned).
create or replace function enforce_campaign_transition_rules()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.platform_take_rate is distinct from old.platform_take_rate then
    raise exception 'platform_take_rate is set by admins only';
  end if;
  if new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at then
    raise exception 'review fields are set by admins only';
  end if;
  if new.brand_id is distinct from old.brand_id then
    raise exception 'campaigns cannot be moved to another brand';
  end if;

  if old.status = 'pending' and new.status <> 'pending' then
    raise exception 'Only admins can move a campaign out of pending review';
  end if;

  if new.status is distinct from old.status then
    if not ((old.status = 'active' and new.status = 'paused')
            or (old.status = 'paused' and new.status = 'active')) then
      raise exception 'Brands can only pause or resume a campaign';
    end if;
    if new.status = 'active' then
      if exists (select 1 from brands where id = new.brand_id and status = 'suspended') then
        raise exception 'This brand is suspended; campaigns cannot be resumed';
      end if;
      if coalesce(new.days_left, 1) <= 0 then
        raise exception 'This campaign has ended; extend its days before resuming';
      end if;
    end if;
  end if;

  if old.status <> 'pending' then
    if new.rate_per_100k is distinct from old.rate_per_100k then
      raise exception 'rate_per_100k cannot be changed after campaign approval';
    end if;
    if new.payout_mode is distinct from old.payout_mode then
      raise exception 'payout_mode cannot be changed after campaign approval';
    end if;
    if coalesce(new.min_views_per_post, 0) > coalesce(old.min_views_per_post, 0)
       or coalesce(new.min_views_total, 0) > coalesce(old.min_views_total, 0) then
      raise exception 'view minimums can only be lowered after campaign approval';
    end if;
  end if;
  return new;
end $$;
-- (trigger trg_campaign_transition_rules from 006 already calls this function)
drop trigger if exists trg_campaign_transition_rules on campaigns;
create trigger trg_campaign_transition_rules
  before update on campaigns
  for each row execute function enforce_campaign_transition_rules();

-- =========================================================================
-- 5. brands
-- =========================================================================
drop policy if exists "own brand" on brands;
drop policy if exists "own brand select" on brands;
drop policy if exists "own brand insert" on brands;
drop policy if exists "own brand update" on brands;
create policy "own brand select" on brands
  for select using (owner_id = auth.uid());
create policy "own brand insert" on brands
  for insert with check (
    owner_id = auth.uid()
    and coalesce(status, 'active') = 'active'
    and suspended_reason is null
  );
create policy "own brand update" on brands
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
-- NOTE: no DELETE policy (it cascaded into topups and orphaned campaigns).

create or replace function brands_lock_admin_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.status is distinct from old.status
     or new.suspended_reason is distinct from old.suspended_reason then
    raise exception 'brand suspension is managed by admins only';
  end if;
  if new.owner_id is distinct from old.owner_id then
    raise exception 'brands.owner_id cannot be changed';
  end if;
  return new;
end $$;

drop trigger if exists trg_brands_lock_admin_fields on brands;
create trigger trg_brands_lock_admin_fields
  before update on brands
  for each row execute function brands_lock_admin_fields();

-- =========================================================================
-- 6. bounties: rates lock once the campaign is approved
-- =========================================================================
create or replace function bounties_lock_live_rates()
returns trigger language plpgsql as $$
declare
  camp_status text;
begin
  if auth.uid() is null then
    return coalesce(new, old);
  end if;
  select status::text into camp_status from campaigns
   where id = coalesce(old.campaign_id, new.campaign_id);
  if tg_op = 'UPDATE' then
    if new.campaign_id is distinct from old.campaign_id then
      raise exception 'bounties cannot be moved to another campaign';
    end if;
    if camp_status <> 'pending'
       and (new.rate_per_100k is distinct from old.rate_per_100k
            or new.budget_cap is distinct from old.budget_cap) then
      raise exception 'bounty rate and budget cannot change after campaign approval';
    end if;
    return new;
  end if;
  -- DELETE: keep bounties that clips are already earning on.
  if camp_status <> 'pending'
     and exists (select 1 from clips where bounty_id = old.id) then
    raise exception 'this bounty has clips; deactivate it instead of deleting';
  end if;
  return old;
end $$;

drop trigger if exists trg_bounties_lock_live_rates on bounties;
create trigger trg_bounties_lock_live_rates
  before update or delete on bounties
  for each row execute function bounties_lock_live_rates();

-- =========================================================================
-- 7. brand_requests: owners can (re)submit, never approve
-- =========================================================================
drop policy if exists "brand_requests_owner_insert" on brand_requests;
create policy "brand_requests_owner_insert" on brand_requests
  for insert with check (auth.uid() = user_id and status = 'pending' and reviewed_at is null);

create or replace function brand_requests_lock_review()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.status <> 'pending' or new.reviewed_at is not null then
    raise exception 'brand requests are reviewed by admins only';
  end if;
  if new.user_id is distinct from old.user_id then
    raise exception 'brand_requests.user_id cannot be changed';
  end if;
  return new;
end $$;

drop trigger if exists trg_brand_requests_lock_review on brand_requests;
create trigger trg_brand_requests_lock_review
  before update on brand_requests
  for each row execute function brand_requests_lock_review();

-- =========================================================================
-- 8. profiles: identity columns are not user-editable either
-- =========================================================================
-- (017's role/status rules kept; email/provider added. The email in profiles
-- is used to find the admin's reviewer id.)
create or replace function profiles_lock_role_status()
returns trigger as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.role is distinct from old.role and new.role = 'admin' then
    raise exception 'profiles.role cannot be changed to admin via the API';
  end if;
  if new.status is distinct from old.status then
    raise exception 'profiles.status cannot be changed via the API';
  end if;
  if new.email is distinct from old.email
     or new.provider is distinct from old.provider
     or new.provider_user_id is distinct from old.provider_user_id then
    raise exception 'profile identity fields cannot be changed via the API';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- =========================================================================
-- 9. stored links must be http(s) — a `javascript:` URL runs when clicked
-- =========================================================================
-- NOT VALID: enforced for new/changed rows without failing on old data.
-- Check old rows with:  select id, source_material_url from campaigns
--   where source_material_url !~* '^https?://';
alter table campaigns drop constraint if exists campaigns_source_material_url_http;
alter table campaigns add constraint campaigns_source_material_url_http
  check (source_material_url is null or source_material_url ~* '^https?://') not valid;
alter table brands drop constraint if exists brands_logo_url_http;
alter table brands add constraint brands_logo_url_http
  check (logo_url is null or logo_url ~* '^https?://') not valid;
alter table clips drop constraint if exists clips_post_url_http;
alter table clips add constraint clips_post_url_http
  check (post_url ~* '^https?://') not valid;

-- =========================================================================
-- 10. one-time use for emailed admin action links
-- =========================================================================
-- Each signed link may run once. Previously a "Record top-up" link replayed
-- more than an hour later credited the brand a second time.
create table if not exists admin_action_uses (
  token_sig text primary key,
  action text not null,
  target_id text not null,
  used_at timestamptz not null default now(),
  -- null = running, true = done, false = failed (the same link may retry).
  -- Rows are never deleted: this doubles as a log of every email action.
  succeeded boolean
);
alter table admin_action_uses add column if not exists succeeded boolean;
alter table admin_action_uses enable row level security;
-- NOTE: no policies — service role only.
