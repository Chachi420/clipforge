import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * ONE-TIME route: insert the Kick Clipping Program campaign + 9 tier
 * bounties. Fixed payload only — the request body is ignored, nothing is
 * deleted, and re-runs only fill in missing bounties (never overwrites).
 * No clips, view totals, or payout records are created.
 *
 * Auth: `Authorization: Bearer <KICK_ADD_TOKEN>`; fails closed when the
 * env var is missing. Tombstone this file (410) immediately after use and
 * delete the KICK_ADD_TOKEN env var from Vercel.
 */

export const dynamic = "force-dynamic";

const SLUG = "kick-clipping-program";

const RULES = `Reported result (Abhinav-reported; Discord-program total, not verified in Wondeed): $20,000 budget, 40,000,000 views, July-September. Brief recreated on Wondeed from the Discord-run Kick Clipping Program. Tracking and payouts in the original program ran through a Discord bot; the mechanics below are adapted to Wondeed flows.

Clips from approved (whitelisted) Kick streamers only. Check the whitelist before posting; do not submit a streamer who is not listed unless staff confirms they are allowed. Clipping outside the whitelist may result in clip removal, reduced eligibility, or payout denial.

Pages must stay Kick-focused: Kick clips, Kick streamers, Kick-related content and approved Kick updates only. No Twitch clips, YouTube clips, clips from other streaming platforms, random influencer clips, unrelated paid promotions, or content not connected to Kick.

Payouts are monthly in USDT (ERC-20, Ethereum network only). Standard rate $40 per 100k views ($400 per 1M); creator tiers range $10-$80 per 100k. Check the bounty matching your creator before clipping, because the creator determines the rate. Set up a valid USDT ERC-20 wallet (0x address) before payouts; wrong networks such as TRC-20 or BSC may result in lost funds, and incorrect wallet details may delay or prevent payment.

To qualify for payout you must reach 100,000 total views, combined across approved clips in the same payout cycle. Views do not carry over between cycles. Clips start counting toward stats at 1,000 views; clips below 1,000 views do not count yet.

Accounts: connect each posting account and add the verification code to its bio, as per Wondeed verification. Enter the username only, without @ or profile links. Maximum 2 active pages per clipper unless staff approves more.

Overlays and branding: every clip must use the correct overlay for its streamer, matching the official overlay guide exactly, and must clearly show Kick branding, the Kick logo, and the streamer name. Check the overlay before posting.

Clip requirements: in English; from a Kick stream within the last 30 days; original content from a Kick stream. Submit each clip under the bounty matching its creator, within 12 hours of posting and before any announced cycle cutoff. Posting alone does not make a clip eligible; it must also be submitted correctly.

Multi-streamer rule: if multiple streamers appear in one clip (same camera feed, gameplay POV, IRL setup, group angle, or shared scene), submit under the lowest-rate streamer shown, and match the overlay to that streamer. Failure may result in removal or payout denial.

Low-value reaction clips may be removed or denied: clips where the streamer barely reacts, says almost nothing, is not the main focus, or where the clip is mostly external content, mainly posted to farm views, or mostly a reupload of someone else's content.

Not allowed: NSFW; banned or highly controversial content or dangerous acts; political content; Twitch/YouTube or other non-Kick platform clips; chat-roulette content such as Monkey or Omegle; unrelated third-party overlays, ads, logos, or watermarks. Leaking internal program information, private instructions, payout details, or admin-only updates is not allowed.

Fake engagement: all views and engagement must be real. No view/like/comment botting, paid engagement, fake shares, artificial traffic, manipulated views, engagement pods, collab posts, or anything that abuses tracking or payouts. Do not hide likes. Clips with bad engagement (low comments/likes relative to views) may also not be accepted. Violations may result in payout denial, warnings, penalties, or removal.

Streamer and caption guidelines: represent streamers fairly, respectfully, and accurately. No misleading edits, false claims, negative framing, harmful portrayals, fake quotes, fake drama, false accusations, or captions that do not match the clip. Do not distort streamer appearance with exaggerated filters, warped face/body effects, engagement-bait edits, or edits that make the streamer look bad or misrepresent them. No hate speech, racism, racial slurs, discriminatory language, dehumanising slurs, or content targeting protected groups, including in reactions, commentary, jokes, context, or engagement. If a clip includes racist language, dehumanising slurs, or protected-group targeting, do not post or submit it.

Streamer self-clipping is not allowed: streamers cannot use their own official TikTok, Instagram, X, or YouTube accounts to post clips of themselves for payouts. This program is for independent clipping pages only.

X/Twitter: pages must stay Kick-focused. No OnlyFans creator promotions, unrelated influencer clips, random paid promos, non-Kick creator watermarks, or content not connected to Kick streaming. Every X clipping post must include the Kick link of the streamer shown in the overlay in the replies. Kick-affiliated X pages may be asked to support official Kick updates.

Gambling-partnered X pages: X pages partnered with, sponsored by, or branded around any gambling company are not allowed to post gambling clips in this program, and if partnered with a gambling company may not participate. Violation can lead to removal.

Unsure whether a clip, caption, edit, page, or post is allowed? Ask support before posting. Violations may result in clip removal, payout denial, reduced eligibility, warnings/penalties, or removal from the program.`;

// Creator commands transcribed from Discord #creator-commands-rates
// screenshots (Nov 14, 2026). Two groups have no visible header in their
// screenshot and were assigned by ordering: the 24 names after the $40
// block (before $30) and the 5 names after the $20 block (before $15).
const TIERS: { name: string; rate: number; creators: string[] }[] = [
  { name: "$80 tier", rate: 80, creators: ["stake", "moon", "davido"] },
  { name: "$60 tier", rate: 60, creators: ["musicstreamers", "patriceevra"] },
  {
    name: "$40 tier (standard)",
    rate: 40,
    creators: [
      "cuffem", "cheesur", "samfrank", "other", "iamtiagz", "konvy",
      "trainwreckstv", "messymaj", "odablock", "mizkif", "j2hundred", "tir",
      "dgdecor", "jackjoseph", "conorbenn", "tyriquehyde", "blondish",
      "connorsinann", "noahprice69", "woodyandkleiny", "isaacfrancis",
      "kingsamjonesiii", "ethanqi", "jeanmarie", "bigmeech4life",
      "celinapowell", "ansem", "nelkboys", "isaacnaks", "drefurtado",
      "bangwilliams", "alhan", "dangerboydeegan", "dlow", "meltt", "demibagby",
    ],
  },
  {
    name: "$30 tier",
    rate: 30,
    creators: [
      "adinross", "lospollostv", "gymskin", "yera", "n3on", "chuzzington",
      "jrakey", "deshaefrost", "dillonxlatham", "michaelbeasley",
      "merabdvalishvili", "cortezmma", "jidion", "babyrich1k", "jackdoherty",
      "iceposeidon", "chowbabygirl", "derekking", "blame", "tessaortega",
      "treyliving", "orangie", "sangtar", "saucewalka102",
    ],
  },
  { name: "$27 tier", rate: 27, creators: ["edmatthews"] },
  {
    name: "$25 tier",
    rate: 25,
    creators: [
      "hstikkytokky", "flaminhotmitts", "sneako", "fafafitness11",
      "crystalizaguirre", "rampagejackson",
    ],
  },
  {
    name: "$20 tier",
    rate: 20,
    creators: [
      "oblivionsw", "zavalahimself", "eedwinrg", "akademiks", "amandasoliss",
      "beavo", "ryangarcia", "ninadrama", "gemelojmc", "androgenic",
      "fiivestar", "alexbigred", "6ix9ine", "asyarae", "vinnythetwister",
      "iamnevaehakira",
    ],
  },
  {
    name: "$15 tier",
    rate: 15,
    creators: ["xqc", "clavicular", "larrywheels", "babyalien"],
  },
  {
    name: "$10 tier",
    rate: 10,
    creators: [
      "asmongold", "deenthegreat", "ashtonhall", "adrienbroner", "chrisean",
      "blueface",
    ],
  },
];

function bountyRequirements(
  tier: (typeof TIERS)[number],
): string {
  const base = `Creators (Discord command): ${tier.creators.join(", ")}. Submit under the bounty matching the clip's creator. If multiple streamers appear in one clip, use the lowest-rate creator shown.`;
  if (tier.rate === 40) {
    return `${base} Includes /other for whitelisted creators not listed in another tier.`;
  }
  return base;
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.KICK_ADD_TOKEN;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export async function GET() {
  return NextResponse.json({ error: "POST only" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  if (!process.env.KICK_ADD_TOKEN) {
    return NextResponse.json(
      { error: "not configured (KICK_ADD_TOKEN missing)" },
      { status: 503 },
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service client not configured" },
      { status: 503 },
    );
  }

  const { data: existing, error: findError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", SLUG)
    .maybeSingle();
  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  let campaignId: string;
  let created = false;
  const extended: Record<string, boolean> = {};
  const extendedErrors: string[] = [];

  if (existing) {
    campaignId = (existing as { id: string }).id;
  } else {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        slug: SLUG,
        name: "Kick Clipping Program",
        status: "paused",
        type: "bounty",
        category: "TV & Streaming",
        platforms: ["tiktok", "instagram", "youtube", "x"],
        payout_method: "usdt_eth",
        rate_per_100k: 40,
        platform_rates: null,
        min_views_per_post: 1000,
        min_views_total: 100000,
        days_left: 0,
        start_date: "2026-07-01",
        budget_cap: 20000,
        duration_mode: "deadline",
        payout_mode: "payrate",
        pot_value: null,
        bounty_pot: null,
        account_limit: 2,
        rules: RULES,
      })
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "campaign insert failed" },
        { status: 500 },
      );
    }
    campaignId = (data as { id: string }).id;
    created = true;

    // Best-effort extended fields (added by later migrations; the live DB
    // may not have them). Each failure is reported, never fatal.
    const extendedFields: Record<string, unknown> = {
      eligibility_type: "open",
      promo_formats: ["video"],
      aspect_ratios: ["9:16"],
      min_clips_expected: 1,
      requires_preapproval: false,
    };
    for (const [field, value] of Object.entries(extendedFields)) {
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({ [field]: value })
        .eq("id", campaignId);
      extended[field] = !updateError;
      if (updateError) extendedErrors.push(`${field}: ${updateError.message}`);
    }
  }

  const { data: existingBounties, error: bountyReadError } = await supabase
    .from("bounties")
    .select("name")
    .eq("campaign_id", campaignId);
  if (bountyReadError) {
    return NextResponse.json(
      { error: bountyReadError.message, campaignId, created },
      { status: 500 },
    );
  }
  const have = new Set(
    (existingBounties ?? []).map((b: { name: string }) => b.name),
  );
  const missing = TIERS.filter((t) => !have.has(t.name));
  const inserted: string[] = [];
  if (missing.length > 0) {
    const { error: bountyError } = await supabase.from("bounties").insert(
      missing.map((t) => ({
        campaign_id: campaignId,
        name: t.name,
        rate_per_100k: t.rate,
        requirements: bountyRequirements(t),
        is_active: true,
        budget_cap: null,
      })),
    );
    if (bountyError) {
      return NextResponse.json(
        {
          error: bountyError.message,
          campaignId,
          created,
          bountiesExisting: [...have],
        },
        { status: 500 },
      );
    }
    inserted.push(...missing.map((t) => t.name));
  }

  return NextResponse.json({
    ok: true,
    campaignId,
    slug: SLUG,
    created,
    alreadyExists: !created,
    bountiesInserted: inserted,
    bountiesExisting: [...have],
    extended,
    extendedErrors,
    note: "No clips, view totals, or payout records were created.",
  });
}
