// Domain types for ClipForge. Mirrors the Supabase schema 1:1.

export type Platform = "tiktok" | "instagram" | "youtube" | "x";
export type CampaignStatus = "active" | "paused" | "private" | "pending";
export type CampaignType = "per_view" | "bounty" | "pot";
export type PayoutMethod = "paypal" | "usdt_eth" | "usdc_eth" | "upi";
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
  payoutMethod: PayoutMethod;  /** rate per 100k views; per-platform overrides win over global */
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
  /** brand that owns the campaign — used for the "Verified funds" badge */
  brandId?: string;
  /** eligibility gating for joining the campaign */
  eligibilityType?: EligibilityType;
  minFollowers?: number | null;
  minAvgViews?: number | null;
}

/** How a campaign gates who can join. */
export type EligibilityType = "open" | "followers" | "engagement" | "invite_only";

export const ELIGIBILITY_LABELS: Record<EligibilityType, string> = {
  open: "Open to all",
  followers: "Follower minimum",
  engagement: "Engagement minimum",
  invite_only: "Invite only",
};

export const ELIGIBILITY_DESCRIPTIONS: Record<EligibilityType, string> = {
  open: "Anyone with a verified account can join instantly.",
  followers: "Clippers need a verified account with at least X followers.",
  engagement: "Clippers need a verified account averaging at least X views.",
  invite_only: "Only clippers you invite can join.",
};

/** Rate multiplier tier: clippers with >= minFollowers earn rate * multiplier. */
export interface RateTier {
  id?: string;
  minFollowers: number;
  multiplier: number;
}

/** An invite to an invite-only campaign. */
export interface CampaignInvite {
  id: string;
  campaignId: string;
  clipperId: string | null;
  email: string | null;
  code: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
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
  role: string;
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
  upi: "UPI",
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
