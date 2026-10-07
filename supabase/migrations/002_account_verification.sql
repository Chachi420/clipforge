-- 002: account verification (bio-code flow)
alter table social_accounts
  add column if not exists verification_code text,
  add column if not exists follower_count integer not null default 0,
  add column if not exists platform_user_id text,
  add column if not exists verified_at timestamptz;

-- backfill codes for any existing rows
update social_accounts
set verification_code = 'CF-' || upper(substr(md5(random()::text || id::text), 1, 6))
where verification_code is null;

alter table social_accounts alter column verification_code set not null;
create unique index if not exists social_accounts_verification_code_key
  on social_accounts (verification_code);
