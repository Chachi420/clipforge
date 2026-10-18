-- 015_campaign_eligibility.sql
-- Campaign eligibility: open | followers | engagement | invite_only
-- Brands set the gate per campaign; clippers prove eligibility via verified
-- social accounts before joining. Invite-only campaigns use campaign_invites.

-- Campaign eligibility columns
alter table campaigns add column if not exists eligibility_type text not null default 'open';
alter table campaigns add column if not exists min_followers int;
alter table campaigns add column if not exists min_avg_views int;

-- Who joined what
-- NOTE: campaign_members (001) already tracks joins and is what the app reads
-- for isJoined. campaign_joins is kept for forward-compat; prefer campaign_members.
create table if not exists campaign_joins (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  clipper_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(campaign_id, clipper_id)
);

-- Invite-only campaigns
create table if not exists campaign_invites (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  clipper_id uuid references profiles(id) on delete cascade,
  email text,
  code text unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(campaign_id, clipper_id)
);

-- Tiered rates: e.g. 10K+ followers = 1.5x rate
create table if not exists campaign_rate_tiers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  min_followers int not null,
  multiplier numeric not null default 1.0
);

-- ---------- RLS ----------

alter table campaign_joins enable row level security;
alter table campaign_invites enable row level security;
alter table campaign_rate_tiers enable row level security;

-- campaign_joins: clippers manage their own rows
drop policy if exists "own joins" on campaign_joins;
create policy "own joins" on campaign_joins
  for all using (clipper_id = auth.uid());

-- campaign_invites: clippers read/update their own invites
drop policy if exists "own invites read" on campaign_invites;
create policy "own invites read" on campaign_invites
  for select using (clipper_id = auth.uid());

drop policy if exists "own invites update" on campaign_invites;
create policy "own invites update" on campaign_invites
  for update using (clipper_id = auth.uid())
  with check (clipper_id = auth.uid());

-- campaign_invites: brands manage invites for their own campaigns
drop policy if exists "brand manages own campaign invites" on campaign_invites;
create policy "brand manages own campaign invites" on campaign_invites
  for all using (
    exists (
      select 1 from campaigns c
      join brands b on b.id = c.brand_id
      where c.id = campaign_invites.campaign_id
      and b.owner_id = auth.uid()
    )
  );

-- campaign_rate_tiers: public read (clippers see tiered rates)
drop policy if exists "public read tiers" on campaign_rate_tiers;
create policy "public read tiers" on campaign_rate_tiers
  for select using (true);

-- campaign_rate_tiers: brands manage tiers for their own campaigns
drop policy if exists "brand manages own campaign tiers" on campaign_rate_tiers;
create policy "brand manages own campaign tiers" on campaign_rate_tiers
  for all using (
    exists (
      select 1 from campaigns c
      join brands b on b.id = c.brand_id
      where c.id = campaign_rate_tiers.campaign_id
      and b.owner_id = auth.uid()
    )
  );
