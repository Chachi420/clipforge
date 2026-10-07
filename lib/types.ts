// Domain types for ClipForge. Mirrors the Supabase schema 1:1.

export type Platform = "tiktok" | "instagram" | "youtube" | "x";
export type CampaignStatus = "active" | "paused" | "private";
export type CampaignType = "per_view" | "bounty" | "pot";
export type PayoutMethod = "paypal" | "usdt_eth" | "usdc_eth";
export type TrackingStatus = "tracking" | "not_tracking" | "flagged";

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  iconUrl: string;
  status: CampaignStatus;
  type: CampaignType;
  category: string;
  platforms: Platform[];
  payoutMethod: PayoutMethod;
  /** rate per 100k views; per-platform overrides win over global */
  ratePer100k: number;
  platformRates?: Partial<Record<Platform, number>>;
  minViewsPerPost: number;
  minViewsTotal: number;
  daysLeft: number;
  startDate: string;
  budgetCap?: number;
  durationMode: "deadline" | "budget";
  payoutMode: "payrate" | "pot";
  potValue?: number;
  bountyPot?: number;
  accountLimit?: number;
  rules: string;
  isJoined?: boolean;
}

export interface Bounty {
  id: string;
  campaignId: string;
  name: string;
  ratePer100k: number;
  requirements: string | null;
  isActive: boolean;
  clipCount: number;
  totalViews: number;
  budgetCap?: number;
  budgetUsedPct: number;
}

export interface Clip {
  id: string;
  campaignId: string;
  bountyId: string | null;
  platform: Platform;
  postUrl: string;
  accountHandle: string;
  streamerName: string;
  trackingStatus: TrackingStatus;
  views: number;
  likes: number;
  comments: number;
  engagementPct: number;
  payout: number;
  submittedAt: string;
}

export interface PayoutCycle {
  id: string;
  campaignId: string;
  campaignName: string;
  cycleNumber: number;
  periodStart: string;
  periodEnd: string;
  snapshotAt: string | null;
  status: "live" | "pending_review" | "awaiting_mark_paid" | "paid";
  estimatedAmount: number;
  totalViews: number;
  totalClips: number;
}

export interface PaymentMethodRow {
  id: string;
  type: PayoutMethod;
  label: string;
  masked: string;
  isDefault: boolean;
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  verified: boolean;
}

export interface ClipperProfile {
  id: string;
  discordId: string;
  discordUsername: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string;
  status: "active" | "suspended";
  joinedAt: string;
  publicProfile: boolean;
  clipsSubmitted: number;
  avgClipsPerDay: number;
  activeDays: number;
}

export interface Team {
  id: string;
  name: string;
  referralCode: string;
  members: number;
  commissionEarned: number;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
};

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  paypal: "PayPal",
  usdt_eth: "USDT (ETH)",
  usdc_eth: "USDC (ETH)",
};
