-- 020: per-campaign platform take rate (negotiated per client, set manually by admin).
-- NULL or missing → engine default (PLATFORM_TAKE_RATE = 0.2 in lib/payout-math.ts).
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS platform_take_rate numeric DEFAULT 0.2;
