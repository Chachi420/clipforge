-- 022: allow UPI as a payout method.
--
-- The Payments page (components/PaymentsView.tsx) and the campaign brief
-- form (components/brand/CampaignBriefForm.tsx) both offer "UPI", and
-- lib/actions.ts validates UPI IDs, but the payout_method enum from 001
-- only has paypal / usdt_eth / usdc_eth — so saving UPI failed with
-- `invalid input value for enum payout_method: "upi"`.
--
-- Additive only: adds an enum value, changes no rows. Safe to re-run.
alter type payout_method add value if not exists 'upi';
