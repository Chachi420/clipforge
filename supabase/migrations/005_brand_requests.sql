-- Brand access requests: sales-led onboarding.
-- A signed-in user requests brand access; admin approves -> role='brand' + brands row.

create table if not exists brand_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  email text not null,
  website text,
  budget_range text not null default 'under_1k',
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id)
);

alter table brand_requests enable row level security;

-- Users can read/insert their own request; service role (admin) bypasses RLS.
create policy "brand_requests_owner_read"
  on brand_requests for select
  using (auth.uid() = user_id);

create policy "brand_requests_owner_insert"
  on brand_requests for insert
  with check (auth.uid() = user_id);

create index if not exists brand_requests_status_idx on brand_requests(status);
