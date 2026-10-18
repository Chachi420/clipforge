-- 016: brand onboarding — first-login name capture
alter table brands
  add column if not exists onboarding_completed boolean not null default false;
