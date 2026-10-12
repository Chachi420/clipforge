-- 008: contact_messages — stores contact-form submissions.
-- Idempotent: safe to re-run.
--
-- RLS ON. One INSERT-only policy for anon + authenticated (anyone can
-- submit the form, including logged-out visitors). No select/update/delete
-- policies — clients cannot read messages; admin reads via the service role.

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

drop policy if exists "anyone can submit contact messages" on contact_messages;
create policy "anyone can submit contact messages" on contact_messages
  for insert with check (true);
-- NOTE: no select/update/delete policies — reads are service-role only.
