-- 014: Phone-callback sales requests (India B2B motion for /brands page).
-- Public insert (anyone can request a callback); reads are service-role only.

create table if not exists callback_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,               -- normalized 10-digit Indian mobile
  company text,
  message text,
  status text not null default 'new', -- new | contacted | closed
  created_at timestamptz not null default now()
);

alter table callback_requests enable row level security;

-- Anyone (anon) can submit a callback request.
drop policy if exists "callback_requests public insert" on callback_requests;
create policy "callback_requests public insert"
  on callback_requests for insert
  with check (true);

-- No public read/update/delete: admin reads via the service role.
-- (Service role bypasses RLS entirely.)

create index if not exists callback_requests_status_idx
  on callback_requests (status, created_at desc);
