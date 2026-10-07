-- Demo seed: a few campaigns + bounties. Clippers, clips and payouts are
-- created at runtime by the app.

insert into campaigns (slug, name, status, type, category, platforms, payout_method,
  rate_per_100k, platform_rates, min_views_per_post, min_views_total,
  days_left, start_date, duration_mode, payout_mode, account_limit, rules)
values
  ('kick-clipping','Kick Clipping','active','bounty','TV & Streaming',
   '{tiktok,instagram,youtube,x}','usdt_eth',300,
   '{"tiktok":300,"instagram":300,"youtube":300,"x":300}',
   1000,25000,46,'2026-10-03','budget','payrate',5,
   'Botting and fake engagement is not allowed, in any capacity. Keep posts public until payment is received.'),
  ('clix-and-lacy','Clix & Lacy','active','per_view','Gaming',
   '{tiktok,instagram,youtube,x}','paypal',100,
   '{"tiktok":100,"instagram":100,"youtube":100,"x":100}',
   1000,100000,46,'2026-09-20','deadline','payrate',null,
   'Follow campaign requirements. Do not hide engagement metrics.'),
  ('rumble','Rumble','active','pot','Sports',
   '{tiktok,instagram,youtube,x}','paypal',0,null,
   1000,5000,28,'2026-09-10','budget','pot',null,
   'Pot-style payout: earnings are a proportional share of total campaign views.')
on conflict (slug) do nothing;

insert into bounties (campaign_id, name, rate_per_100k, requirements, is_active, budget_cap)
select c.id, b.name, b.rate, b.req, true, b.cap
from campaigns c
join (values
  ('kick-clipping','bluesclues124',10,null,5000),
  ('kick-clipping','primeclips',45,'Min 50K followers on posting account',8000),
  ('kick-clipping','kickmoments',120,'English audience 50%+',10000),
  ('kick-clipping','late-night-kick',300,'Clips from 12am-6am streams only',6000)
) as b(slug,name,rate,req,cap) on b.slug = c.slug
on conflict do nothing;
