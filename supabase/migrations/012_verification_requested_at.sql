-- 012: track when a verification code was issued.
-- The automated bio check (Instagram via Apify) only runs once the code has
-- been in the user's hands for 3 minutes — gives them time to add it to
-- their bio and bounds Apify spend on instant re-clicks.
alter table social_accounts
  add column if not exists verification_requested_at timestamptz;

-- Backfill: existing pending rows use their connection time so they can't
-- bypass the gate with a null timestamp.
update social_accounts
  set verification_requested_at = connected_at
  where verification_requested_at is null;
