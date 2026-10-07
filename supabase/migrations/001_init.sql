-- ClipForge initial schema. Mirrors the product teardown data model.
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ---------- enums ----------
do $$ begin
  create type platform as enum ('tiktok','instagram','youtube','x');
exception when duplicate_object then null; end $$;
do $$ begin
  create type campaign_status as enum ('active','paused','private');
exception when duplicate_object then null; end $$;
do $$ begin
  create type campaign_type as enum ('per_view','bounty','pot');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payout_method as enum ('paypal','usdt_eth','usdc_eth');
exception when duplicate_object then null; end $$;
do $$ begin
  create type tracking_status as enum ('tracking','not_tracking','flagged');
exception when duplicate_object then null; end $$;
do $$ begin
  create type cycle_status as enum ('live','pending_review','awaiting_mark_paid','paid');
exception when duplicate_object then null; end $$;

-- ---------- profiles (one row per auth user; id = auth.users.id) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'google',   -- google | azure
  provider_user_id text,
  email text,
  display_name text not null default 'Clipper',
  bio text,
  avatar_url text,
  status text not null default 'active',
  public_profile boolean not null default false,
  role text not null default 'clipper',      -- clipper | brand | admin
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(provider, provider_user_id)
);

-- auto-create a profile row on first OAuth sign-in
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, provider, provider_user_id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_app_meta_data->>'provider', 'google'),
    new.raw_user_meta_data->>'sub',
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'clipper'), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- social accounts ----------
create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  platform platform not null,
  handle text not null,
  verified boolean not null default false,
  connected_at timestamptz not null default now(),
  unique(user_id, platform, handle)
);

-- ---------- campaigns ----------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon_url text,
  status campaign_status not null default 'active',
  type campaign_type not null default 'per_view',
  category text not null default 'Other',
  platforms platform[] not null default '{}',
  payout_method payout_method not null default 'paypal',
  rate_per_100k numeric not null default 0,
  platform_rates jsonb,
  min_views_per_post integer not null default 1000,
  min_views_total integer not null default 25000,
  days_left integer not null default 30,
  start_date date not null default current_date,
  budget_cap numeric,
  duration_mode text not null default 'deadline',   -- deadline | budget
  payout_mode text not null default 'payrate',       -- payrate | pot
  pot_value numeric,
  bounty_pot numeric,
  account_limit integer,
  rules text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- campaign membership ----------
create table if not exists campaign_members (
  user_id uuid not null references profiles(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, campaign_id)
);

-- ---------- bounties ----------
create table if not exists bounties (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  rate_per_100k numeric not null,
  requirements text,
  is_active boolean not null default true,
  budget_cap numeric,
  created_at timestamptz not null default now()
);

-- ---------- clips ----------
create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  bounty_id uuid references bounties(id) on delete set null,
  platform platform not null,
  post_url text not null,
  account_handle text not null,
  streamer_name text not null default '',
  tracking_status tracking_status not null default 'tracking',
  submitted_at timestamptz not null default now()
);

-- ---------- metric snapshots (append-only; rescan ~12h) ----------
create table if not exists clip_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references clips(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  views bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0
);
create index if not exists idx_snapshots_clip_time on clip_metric_snapshots(clip_id, scanned_at desc);

-- ---------- payout cycles ----------
create table if not exists payout_cycles (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  cycle_number integer not null,
  period_start date not null,
  period_end date not null,
  snapshot_at timestamptz,
  status cycle_status not null default 'live',
  unique(campaign_id, cycle_number)
);

-- ---------- payouts ----------
create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references payout_cycles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'clipper',
  estimated_amount numeric not null default 0,
  final_amount numeric,
  status text not null default 'pending',  -- pending | paid
  method payout_method,
  address text,
  total_views bigint not null default 0,
  total_clips integer not null default 0,
  created_at timestamptz not null default now(),
  unique(cycle_id, user_id)
);

-- ---------- payment methods ----------
create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type payout_method not null,
  identifier text not null,          -- email or wallet address (store masked display separately if needed)
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- teams / referrals ----------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  referral_code text unique not null,
  created_at timestamptz not null default now()
);
create table if not exists team_members (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

-- ---------- notifications ----------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table social_accounts enable row level security;
alter table campaign_members enable row level security;
alter table clips enable row level security;
alter table payouts enable row level security;
alter table payment_methods enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table notifications enable row level security;

-- Public read for campaigns & bounties (marketplace is browsable)
alter table campaigns enable row level security;
alter table bounties enable row level security;
create policy "campaigns are publicly readable" on campaigns for select using (true);
create policy "bounties are publicly readable" on bounties for select using (true);

-- Owners can read/update their own rows (service role bypasses for workers/admin)
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own social accounts" on social_accounts for all using (user_id = auth.uid());
create policy "own memberships" on campaign_members for all using (user_id = auth.uid());
create policy "own clips" on clips for all using (user_id = auth.uid());
create policy "own payouts" on payouts for select using (user_id = auth.uid());
create policy "own payment methods" on payment_methods for all using (user_id = auth.uid());
create policy "own teams" on teams for all using (owner_id = auth.uid());
create policy "own team memberships" on team_members for select using (user_id = auth.uid());
create policy "own notifications" on notifications for all using (user_id = auth.uid());

-- ---------- helper: campaign stats ----------
create or replace function campaign_stats(c_id uuid)
returns table (clip_count bigint, total_views bigint) language sql stable as $$
  select count(distinct c.id),
         coalesce(sum(s.views),0)
  from clips c
  left join lateral (
    select views from clip_metric_snapshots
    where clip_id = c.id order by scanned_at desc limit 1
  ) s on true
  where c.campaign_id = c_id;
$$;
