-- 013: Lock profiles.role and profiles.status from self-service updates.
-- P0-1: the "own profile" FOR ALL policy let any signed-in user run
--   UPDATE profiles SET role='brand' (or status='active') via the anon key,
--   bypassing brand vetting and admin suspension. Only the service role
--   (server-side admin actions) may change role/status now.

-- Drop the overly broad policy.
drop policy if exists "own profile" on profiles;

-- Users can read their own profile.
create policy "own profile select"
  on profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile (signup trigger path).
create policy "own profile insert"
  on profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile, but NOT role or status.
-- The trigger below enforces the column restriction.
create policy "own profile update"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger: block role/status changes unless done by service role.
-- (Service role bypasses RLS entirely, so this only affects anon/authenticated.)
create or replace function profiles_lock_role_status()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    raise exception 'profiles.role cannot be changed via the API';
  end if;
  if new.status is distinct from old.status then
    raise exception 'profiles.status cannot be changed via the API';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_lock_role_status_trigger on profiles;
create trigger profiles_lock_role_status_trigger
  before update on profiles
  for each row
  execute function profiles_lock_role_status();
