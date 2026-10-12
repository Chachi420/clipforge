-- ============================================================
-- 007_public_profiles.sql — PII-safe public profile view
-- ============================================================
-- PROBLEM (audit): public clipper pages (/u/[id]) 404 for everyone but the
-- profile owner, because `profiles` RLS is owner-only ("own profile" policy
-- in 001_init.sql). A naive public SELECT policy on `profiles` would expose
-- clipper EMAILS to the world — unacceptable for a marketplace.
--
-- SOLUTION: a narrow, security-definer VIEW exposing ONLY inherently-public
-- columns. A plain view runs with the owner's permissions, so
-- anon/authenticated callers can read display names WITHOUT gaining any
-- access to the base `profiles` table — emails stay locked behind profiles
-- RLS no matter what. (Postgres 15+ default is security_invoker=false,
-- i.e. definer; Supabase runs PG15+.)
--
-- Columns exposed: id, display_name, avatar_url. NEVER email, provider,
-- provider_user_id, or any other column — verify before extending this list.
--
-- Rows are limited to users who opted into public profiles
-- (public_profile = true). This preserves the existing opt-in privacy
-- control at the database level (strictly stronger than the old app-level
-- check in getPublicProfile). Removing the WHERE clause would make EVERY
-- user's display name resolvable — do not do that without a product decision.
--
-- Consumers (code, not this migration):
--   - lib/db.ts getPublicProfile() reads this view for /u/[id]
--   - lib/brand-db.ts getCampaignClippers() resolves display names via it
--
-- SAFE TO RE-RUN: CREATE OR REPLACE + GRANT are idempotent.
-- The founder runs this in the Supabase SQL editor (same as 006).
-- ============================================================

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, display_name, avatar_url
FROM public.profiles
WHERE public_profile = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
