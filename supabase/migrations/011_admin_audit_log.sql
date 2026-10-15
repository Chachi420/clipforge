-- 011: admin audit log
--
-- Every admin decision (panel + email links) is recorded here so actions are
-- attributable and queryable. Written with the service-role client from
-- server code only — no public RLS policies (app-layer gate is email-only).
--
-- Idempotent: safe to run twice.

create table if not exists admin_audit_log (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor       text        not null,
  -- e.g. 'abhinavsingh7946@gmail.com' (panel) or 'abhinavsingh7946@gmail.com (email link)'
  action      text        not null,
  -- e.g. 'clip.approve', 'clip.reject', 'clip.flag', 'clip.unflag',
  --      'account.approve', 'account.reject',
  --      'campaign.approve', 'campaign.reject', 'campaign.rate_change',
  --      'brand_request.approve', 'brand_request.reject',
  --      'topup.record',
  --      'payout.mark_paid',
  --      'clipper.suspend', 'clipper.reactivate',
  --      'brand.suspend', 'brand.reactivate',
  --      'user.role_change'
  target_type text        not null,
  -- 'clip' | 'social_account' | 'campaign' | 'brand_request' | 'brand' |
  -- 'payout' | 'clipper' | 'user'
  target_id   text        not null,
  summary     text        not null,
  metadata    jsonb       not null default '{}'::jsonb
);

create index if not exists idx_admin_audit_log_created
  on admin_audit_log (created_at desc);
create index if not exists idx_admin_audit_log_action
  on admin_audit_log (action);
create index if not exists idx_admin_audit_log_target
  on admin_audit_log (target_type, target_id);

alter table admin_audit_log enable row level security;
-- No policies: only the service-role client (server code) can read/write.
-- The admin panel reads it through lib/admin-actions.ts with requireAdmin().
