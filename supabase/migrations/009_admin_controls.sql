-- 009_admin_controls.sql
-- Admin 3rd side: audit trail for approval actions + indexes for admin lists.
-- No status-enum changes: existing flows (campaign pending/active,
-- clip tracking/pending_review/flagged) are untouched; admin pages act on them.

-- Clips: who reviewed a pending clip and why.
alter table clips
  add column if not exists reviewed_by uuid references profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

-- Campaigns: who approved a pending brief.
alter table campaigns
  add column if not exists reviewed_by uuid references profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

-- Brands: admin suspension (status 'active' | 'suspended'), default keeps live brands live.
alter table brands
  add column if not exists status text not null default 'active',
  add column if not exists suspended_reason text;

-- Clippers: admin suspension uses profiles.status ('active' | 'suspended').
-- No constraint change: status is app-controlled free text today; admin
-- actions only ever write 'active' or 'suspended'.

-- Indexes for the admin list/detail queries.
create index if not exists idx_clips_tracking_status on clips(tracking_status, submitted_at desc);
create index if not exists idx_clips_user on clips(user_id, submitted_at desc);
create index if not exists idx_clips_campaign on clips(campaign_id, submitted_at desc);
create index if not exists idx_profiles_role_status on profiles(role, status);
create index if not exists idx_campaigns_status on campaigns(status, created_at desc);
create index if not exists idx_brands_status on brands(status);
create index if not exists idx_payouts_user_status on payouts(user_id, status);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
