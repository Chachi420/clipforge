/**
 * Production help content for the campaign discovery experience.
 *
 * Lives here (not in lib/mock.ts) because it is real product copy —
 * it must survive any cleanup of demo scaffolding.
 */

export const HOW_IT_WORKS = [
  { title: "Campaign Duration", body: "Deadline-based campaigns run until a fixed end date. Budget-based campaigns run until the budget is spent — most campaigns are budget-based." },
  { title: "Payout Calculation", body: "Payrate-based campaigns pay a flat rate per view. Pot-style campaigns split a fixed pot proportionally by each clipper's share of total views." },
  { title: "Minimum View Requirements", body: "Per-post minimums (e.g. 1,000 views per post) and total minimums (e.g. 25,000 combined views) decide which clips qualify." },
  { title: "Payout Timeline", body: "Payouts are not instant. Every cycle goes through a review step to verify post quality before money moves." },
  { title: "Payment Method", body: "You are paid only via the campaign's specified method (PayPal or crypto). Payments sent to valid details cannot be re-sent." },
  { title: "View Tracking", body: "Tracking begins when you submit a post. Views are rescanned roughly every 12 hours until the campaign ends. YouTube counts engaged views, not impressions." },
];

export const CAMPAIGN_RULES = [
  "No botting or fake engagement, in any capacity.",
  "Audience requirements must match your own (e.g. English-audience campaigns require 50%+ viewers from English-speaking countries).",
  "Follow the campaign's requirements.",
  "Do not hide engagement metrics on your posts.",
  "Meet the campaign's quality standards.",
  "No duplicate posts of the same content on the same account.",
  "Keep posts public until payment is received — clients check post status after.",
  "Staff decisions are final.",
];
