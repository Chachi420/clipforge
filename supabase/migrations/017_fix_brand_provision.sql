-- 017: fix brand auto-provision (013 blocked it).
-- 013's trigger blocked ALL role changes via API, including the intentional
-- brand auto-provision flow (/brand/login → auto-upgrade to brand role).
-- This restores the intended behavior: users can promote themselves to 'brand'
-- via the signup flow, but privilege escalation to 'admin' stays blocked,
-- and status changes stay blocked.

create or replace function profiles_lock_role_status()
returns trigger as $$
begin
  -- Block privilege escalation to admin via the API.
  if new.role is distinct from old.role and new.role = 'admin' then
    raise exception 'profiles.role cannot be changed to admin via the API';
  end if;
  -- Block status changes via the API (suspension is admin-only).
  if new.status is distinct from old.status then
    raise exception 'profiles.status cannot be changed via the API';
  end if;
  return new;
end;
$$ language plpgsql security definer;
