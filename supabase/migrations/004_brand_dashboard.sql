-- 004: brand dashboard — brands table, brand_id on campaigns,
-- 'pending' campaign status (approval queue), brand top-up ledger.

-- ---------- brands ----------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  logo_url text,
  contact_email text,
  created_at timestamptz not null default now(),
  unique(owner_id)
);

-- ---------- campaigns: brand ownership + pending status ----------
alter table campaigns
  add column if not exists brand_id uuid references brands(id) on delete set null;

alter type campaign_status add value if not exists 'pending';

-- ---------- brand top-up ledger (v1: manual, recorded by admin) ----------
create table if not exists brand_topups (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  amount numeric not null check (amount > 0),
  method text,                       -- paypal | crypto | wire
  reference text,                     -- tx id / memo
  recorded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table brands enable row level security;
alter table brand_topups enable row level security;

-- Brand owners can read/update their own brand row.
create policy "own brand" on brands
  for all using (owner_id = auth.uid());

-- Brand owners can insert campaigns (only under their own brand) and
-- update their own campaigns (settings, pause/resume, briefs).
create policy "brand owners insert campaigns" on campaigns
  for insert with check (
    brand_id in (select id from brands where owner_id = auth.uid())
  );
create policy "brand owners update own campaigns" on campaigns
  for update using (
    brand_id in (select id from brands where owner_id = auth.uid())
  );
create policy "brand owners manage bounties" on bounties
  for all using (
    campaign_id in (
      select c.id from campaigns c
      join brands b on b.id = c.brand_id
      where b.owner_id = auth.uid()
    )
  );

-- Brand owners can read their top-up ledger (writes go through admin/service role).
create policy "own topups" on brand_topups
  for select using (
    brand_id in (select id from brands where owner_id = auth.uid())
  );

-- ---------- helper: brand spend from verified views ----------
-- Spend = sum over campaign clips of (latest verified views / 100k * rate).
create or replace function brand_campaign_spend(c_id uuid)
returns numeric language sql stable as $$
  select coalesce(sum(
    (coalesce(s.views, 0)::numeric / 100000)
    * coalesce(campaigns.rate_per_100k, 0)
  ), 0)
  from clips
  join campaigns on campaigns.id = clips.campaign_id
  left join lateral (
    select views from clip_metric_snapshots
    where clip_id = clips.id order by scanned_at desc limit 1
  ) s on true
  where clips.campaign_id = c_id
    and clips.tracking_status <> 'not_tracking';
$$;
