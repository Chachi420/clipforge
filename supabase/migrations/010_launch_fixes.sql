-- 010: launch fixes (audit 2026-10-15)
-- P1-8  brands.owner_id uniqueness guard
-- P1-11 brand_requests owner UPDATE policy (005 shipped read+insert only)
-- P2    payout_carryover table for sub-minimum payout roll-forward
--
-- Idempotent: safe to run twice, safe on the 008/009 database.
-- Paste-friendly for the Supabase SQL editor: plain DDL + guarded DO blocks only.

-- ---------------------------------------------------------------------------
-- P1-8: unique guard on brands.owner_id
--
-- PRE-CHECK (run this BEFORE this migration; the ALTER below will fail with a
-- clear "duplicate key" error if it finds duplicates — deduplicate first):
--   select owner_id, count(*) from brands group by 1 having count(*) > 1;
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  -- Guard against ANY unique constraint already covering brands.owner_id
  -- (not just our name): migration 004 created the brands table with an
  -- inline unique(owner_id), auto-named brands_owner_id_key. On a database
  -- built from 004+, this block is a no-op.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid
     AND a.attnum = ANY (c.conkey)
    WHERE c.conrelid = 'brands'::regclass
      AND c.contype = 'u'
      AND a.attname = 'owner_id'
  ) THEN
    ALTER TABLE brands
      ADD CONSTRAINT brands_owner_id_unique UNIQUE (owner_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- P1-11: brand_requests owner UPDATE policy
-- Lets the requesting user edit their own pending request (resubmission /
-- corrections). 005 only shipped SELECT + INSERT policies, so updates failed
-- on RLS. DROP-then-CREATE keeps this idempotent.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "brand_requests_owner_update" ON brand_requests;

CREATE POLICY "brand_requests_owner_update"
  ON brand_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- P2: payout_carryover — sub-minimum payout roll-forward
--
-- When a close-payout-cycle run finds an amount below the payout minimum, it
-- parks that amount here keyed by (user_id, campaign_id) instead of dropping
-- it; the next cycle adds newly-earned amounts on top until the minimum is
-- reached. Read/written by the close-payout-cycle service-role code (Agent C).
--
-- No RLS policies are attached deliberately: this table is service-role only.
-- Clipper balances are exposed to users via the payouts / brand_campaign_spend
-- path, never by reading this table directly.
-- ---------------------------------------------------------------------------
create table if not exists payout_carryover (
  user_id uuid not null references profiles(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  amount numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, campaign_id)
);

alter table payout_carryover enable row level security;
