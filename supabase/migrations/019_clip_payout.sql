-- 019: per-clip payout column
-- Written by the monthly payout cron so the dashboard can show earned-per-clip.
alter table clips add column if not exists payout numeric not null default 0;
