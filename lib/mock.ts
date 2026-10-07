// Demo dataset. Same shape as the Supabase tables; used until
// NEXT_PUBLIC_SUPABASE_URL is configured (see lib/db.ts).
import type {
  Bounty, Campaign, Clip, ClipperProfile, PaymentMethodRow,
  PayoutCycle, SocialAccount, Team,
} from "./types";

export const profile: ClipperProfile = {
  id: "u_demo",
  provider: "google",
  email: "clipper@example.com",
  displayName: "Demo Clipper",
  bio: null,
  avatarUrl: "",
  status: "active",
  joinedAt: "2026-03-12",
  publicProfile: false,
  clipsSubmitted: 1057,
  avgClipsPerDay: 2.9,
  activeDays: 281,
};

export const campaigns: Campaign[] = [
  {
    id: "c_kick", slug: "kick-clipping", name: "Kick Clipping",
    iconUrl: "", status: "active", type: "bounty", category: "TV & Streaming",
    platforms: ["tiktok", "instagram", "youtube", "x"], payoutMethod: "usdt_eth",
    ratePer100k: 300, platformRates: { tiktok: 300, instagram: 300, youtube: 300, x: 300 },
    minViewsPerPost: 1000, minViewsTotal: 25000, daysLeft: 46,
    startDate: "2026-10-03", durationMode: "budget", payoutMode: "payrate",
    accountLimit: 5,
    rules: "Botting and fake engagement is not allowed, in any capacity. Keep posts public until payment is received. No duplicate posts of the same content on the same account. Staff decisions are final.",
    isJoined: true,
  },
  {
    id: "c_clix", slug: "clix-and-lacy", name: "Clix & Lacy",
    iconUrl: "", status: "active", type: "per_view", category: "Gaming",
    platforms: ["tiktok", "instagram", "youtube", "x"], payoutMethod: "paypal",
    ratePer100k: 100, platformRates: { tiktok: 100, instagram: 100, youtube: 100, x: 100 },
    minViewsPerPost: 1000, minViewsTotal: 100000, daysLeft: 46,
    startDate: "2026-09-20", durationMode: "deadline", payoutMode: "payrate",
    rules: "Follow campaign requirements. Do not hide engagement metrics.",
  },
  {
    id: "c_lex", slug: "lex-valentino", name: "Lex Valentino",
    iconUrl: "", status: "active", type: "per_view", category: "IRL Content",
    platforms: ["instagram"], payoutMethod: "usdc_eth",
    ratePer100k: 250, minViewsPerPost: 1000, minViewsTotal: 10000, daysLeft: 12,
    startDate: "2026-09-26", durationMode: "deadline", payoutMode: "payrate",
    rules: "Quality standards apply. English-speaking audience required (50%+).",
  },
  {
    id: "c_brawl", slug: "bounty-brawl", name: "Bounty Brawl",
    iconUrl: "", status: "active", type: "bounty", category: "Gaming",
    platforms: ["tiktok", "youtube"], payoutMethod: "usdt_eth",
    ratePer100k: 60, bountyPot: 30, minViewsPerPost: 1000, minViewsTotal: 10000,
    daysLeft: 17, startDate: "2026-09-21", durationMode: "budget", payoutMode: "payrate",
    rules: "Bounties have individual qualification requirements.",
  },
  {
    id: "c_rumble", slug: "rumble", name: "Rumble",
    iconUrl: "", status: "active", type: "pot", category: "Sports",
    platforms: ["tiktok", "instagram", "youtube", "x"], payoutMethod: "paypal",
    ratePer100k: 0, potValue: 16000, minViewsPerPost: 1000, minViewsTotal: 5000,
    daysLeft: 28, startDate: "2026-09-10", durationMode: "budget", payoutMode: "pot",
    rules: "Pot-style payout: earnings are a proportional share of total campaign views.",
  },
  {
    id: "c_vayner", slug: "vaynermedia", name: "VaynerMedia",
    iconUrl: "", status: "private", type: "per_view", category: "Brands",
    platforms: ["tiktok", "instagram"], payoutMethod: "paypal",
    ratePer100k: 180, minViewsPerPost: 5000, minViewsTotal: 50000, daysLeft: 60,
    startDate: "2026-10-01", durationMode: "deadline", payoutMode: "payrate",
    rules: "Private campaign — apply for access.",
  },
  {
    id: "c_steak", slug: "steak", name: "Steak",
    iconUrl: "", status: "paused", type: "per_view", category: "Gambling",
    platforms: ["x", "youtube"], payoutMethod: "usdt_eth",
    ratePer100k: 400, minViewsPerPost: 1000, minViewsTotal: 25000, daysLeft: 90,
    startDate: "2026-08-01", durationMode: "budget", payoutMode: "payrate",
    rules: "Campaign paused — tracking continues, new clips disabled.",
  },
  {
    id: "c_adin", slug: "adin-ross", name: "Adin Ross",
    iconUrl: "", status: "paused", type: "per_view", category: "TV & Streaming",
    platforms: ["tiktok", "instagram", "youtube"], payoutMethod: "paypal",
    ratePer100k: 100, minViewsPerPost: 1000, minViewsTotal: 25000, daysLeft: 30,
    startDate: "2026-07-15", durationMode: "deadline", payoutMode: "payrate",
    rules: "Campaign paused.",
  },
  {
    id: "c_pod", slug: "mic-drop-pod", name: "Mic Drop Podcast",
    iconUrl: "", status: "active", type: "per_view", category: "Podcasts",
    platforms: ["tiktok", "youtube"], payoutMethod: "paypal",
    ratePer100k: 80, minViewsPerPost: 1000, minViewsTotal: 25000, daysLeft: 52,
    startDate: "2026-09-15", durationMode: "deadline", payoutMode: "payrate",
    rules: "Clip the best 20–60 seconds. Add your own hook and captions.",
  },
  {
    id: "c_music", slug: "neon-records", name: "Neon Records",
    iconUrl: "", status: "active", type: "bounty", category: "Music",
    platforms: ["tiktok", "instagram"], payoutMethod: "usdc_eth",
    ratePer100k: 120, bountyPot: 500, minViewsPerPost: 1000, minViewsTotal: 10000,
    daysLeft: 21, startDate: "2026-09-28", durationMode: "budget", payoutMode: "payrate",
    rules: "Bounties per track. No re-uploaded label content.",
  },
];

export const bounties: Bounty[] = [
  { id: "b1", campaignId: "c_kick", name: "bluesclues124", ratePer100k: 10, requirements: null, isActive: true, clipCount: 4500, totalViews: 166_120_000, budgetCap: 5000, budgetUsedPct: 62 },
  { id: "b2", campaignId: "c_kick", name: "primeclips", ratePer100k: 45, requirements: "Min 50K followers on posting account", isActive: true, clipCount: 1890, totalViews: 88_400_000, budgetCap: 8000, budgetUsedPct: 41 },
  { id: "b3", campaignId: "c_kick", name: "kickmoments", ratePer100k: 120, requirements: "English audience 50%+", isActive: true, clipCount: 920, totalViews: 41_200_000, budgetCap: 10000, budgetUsedPct: 28 },
  { id: "b4", campaignId: "c_kick", name: "late-night-kick", ratePer100k: 300, requirements: "Clips from 12am–6am streams only", isActive: true, clipCount: 310, totalViews: 12_900_000, budgetCap: 6000, budgetUsedPct: 73 },
  { id: "b5", campaignId: "c_kick", name: "rookie-bounty", ratePer100k: 25, requirements: null, isActive: false, clipCount: 2210, totalViews: 54_000_000, budgetCap: 3000, budgetUsedPct: 100 },
  { id: "b6", campaignId: "c_brawl", name: "brawl-stars", ratePer100k: 60, requirements: null, isActive: true, clipCount: 640, totalViews: 9_800_000, budgetUsedPct: 35 },
  { id: "b7", campaignId: "c_music", name: "neon-anthem", ratePer100k: 120, requirements: "Use official audio", isActive: true, clipCount: 410, totalViews: 6_200_000, budgetCap: 2000, budgetUsedPct: 52 },
];

const clipSeeds: Array<[string, string, Clip["platform"], string, string, number, number, number]> = [
  ["k1", "c_kick", "instagram", "@kick.zone_", "Kick Clipping", 1800, 35, 4],
  ["k2", "c_kick", "tiktok", "@tyh6yiydys", "Kick Clipping", 45200, 1204, 89],
  ["k3", "c_kick", "youtube", "@kick.zone_", "Kick Clipping", 12800, 402, 31],
  ["k4", "c_kick", "x", "@kickk.zone_", "Kick Clipping", 930, 21, 2],
  ["k5", "c_kick", "tiktok", "@tyh6yiydys", "Kick Clipping", 210400, 9800, 412],
  ["k6", "c_kick", "instagram", "@_streamerhub_", "Kick Clipping", 31200, 890, 54],
];

export const clips: Clip[] = clipSeeds.map(([id, campaignId, platform, handle, streamer, views, likes, comments], i) => ({
  id, campaignId, bountyId: i < 2 ? "b1" : null, platform,
  postUrl: `https://example.com/p/${id}`,
  accountHandle: handle, streamerName: streamer,
  trackingStatus: i === 3 ? "not_tracking" : "tracking",
  views, likes, comments,
  engagementPct: Math.round(((likes + comments) / Math.max(views, 1)) * 1000) / 10,
  payout: Math.round((views / 100000) * 120 * 100) / 100,
  submittedAt: `2026-09-${10 + i}T12:00:00Z`,
}));

export const payoutCycles: PayoutCycle[] = [
  { id: "pc_live", campaignId: "c_kick", campaignName: "Kick Clipping", cycleNumber: 15, periodStart: "2026-09-02", periodEnd: "2026-10-01", snapshotAt: null, status: "live", estimatedAmount: 96.4, totalViews: 321800, totalClips: 64 },
  { id: "pc_14", campaignId: "c_kick", campaignName: "Kick Clipping", cycleNumber: 14, periodStart: "2026-08-04", periodEnd: "2026-09-01", snapshotAt: "2026-09-01", status: "awaiting_mark_paid", estimatedAmount: 180, totalViews: 877500, totalClips: 212 },
  { id: "pc_2", campaignId: "c_kick", campaignName: "Kick Clipping", cycleNumber: 2, periodStart: "2026-07-03", periodEnd: "2026-08-06", snapshotAt: "2026-08-06", status: "awaiting_mark_paid", estimatedAmount: 283, totalViews: 1410000, totalClips: 388 },
  { id: "pc_1", campaignId: "c_kick", campaignName: "Kick Clipping", cycleNumber: 1, periodStart: "2026-06-05", periodEnd: "2026-07-06", snapshotAt: "2026-07-06", status: "awaiting_mark_paid", estimatedAmount: 112, totalViews: 402000, totalClips: 156 },
];

export const paymentMethods: PaymentMethodRow[] = [
  { id: "pm1", type: "paypal", label: "PayPal", masked: "de***@example.com", isDefault: true },
  { id: "pm2", type: "usdt_eth", label: "USDT (ETH)", masked: "0xa0d9…dA4d", isDefault: false },
];

export const socialAccounts: SocialAccount[] = [
  { id: "a1", platform: "instagram", handle: "@kick.zone_", verified: true, verificationCode: "CF-DEMO01", followerCount: 12400, verifiedAt: "2026-09-01" },
  { id: "a2", platform: "instagram", handle: "@kickk.zone_", verified: false, verificationCode: "CF-DEMO02", followerCount: 0, verifiedAt: null },
  { id: "a3", platform: "instagram", handle: "@_streamerhub_", verified: true, verificationCode: "CF-DEMO03", followerCount: 8600, verifiedAt: "2026-09-01" },
  { id: "a4", platform: "tiktok", handle: "@tyh6yiydys", verified: false, verificationCode: "CF-DEMO04", followerCount: 0, verifiedAt: null },
];

export const teams: Team[] = [];

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
