// Domain types for ClipForge. Mirrors the Supabase schema 1:1.

export type Platform = "tiktok" | "instagram" | "youtube" | "x";
export type CampaignStatus = "active" | "paused" | "private" | "pending";
export type CampaignType = "per_view" | "bounty" | "pot";
export type PayoutMethod = "paypal" | "usdt_eth" | "usdc_eth";
export type TrackingStatus = "tracking" | "not_tracking" | "flagged" | "pending_review";

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
  verificationCode: string;
  followerCount: number;
  verifiedAt: string | null;
}

export type AuthProvider = "google" | "azure";

export const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  google: "Google",
  azure: "Microsoft",
};

export interface ClipperProfile {
  id: string;
  provider: AuthProvider;
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

// ---------- brand side ----------

export interface Brand {
  id: string;
  ownerId: string;
  name: string;
  logoUrl: string;
  contactEmail: string;
  createdAt: string;
}

export interface BrandTopup {
  id: string;
  brandId: string;
  amount: number;
  method: string | null;
  reference: string | null;
  recordedBy: string | null;
  createdAt: string;
}

/** Campaign row enriched for the brand dashboard (spend, views, clips). */
export interface BrandCampaign extends Campaign {
  brandId: string | null;
  spend: number;
  totalViews: number;
  clipCount: number;
  clipperCount: number;
}

export interface BrandKpis {
  activeCampaigns: number;
  spendMtd: number;
  viewsMtd: number;
  avgEcpm: number;
}

export interface CampaignClipperRow {
  userId: string;
  displayName: string;
  email: string;
  clips: number;
  views: number;
  earnings: number;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  private: "Private",
  pending: "Pending approval",
};
