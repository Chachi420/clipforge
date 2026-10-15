/**
 * Email-actionable admin: instead of opening /admin, the admin (one fixed
 * Google account) gets an email for every item needing review, with signed
 * one-click Approve / Reject links. No login, no webpage.
 *
 * Security: each link carries an HMAC-SHA256 token (signed with CRON_SECRET)
 * binding {action, targetId, expiry}. Tokens expire after 7 days. The action
 * endpoint additionally guards on current DB state (only pending items can be
 * acted on), so replaying a link is harmless.
 *
 * Sending uses Resend. All admin mail goes to the admin's own address, so
 * Resend's no-domain test mode (onboarding@resend.dev) works with zero setup
 * beyond RESEND_API_KEY.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { ADMIN_EMAIL } from "./admin";

export type AdminAction =
  | "approve_clip"
  | "reject_clip"
  | "approve_account"
  | "reject_account"
  | "approve_brand_request"
  | "reject_brand_request"
  | "approve_campaign"
  | "reject_campaign"
  | "record_topup"
  | "mark_payout_paid";

const TOKEN_TTL_SEC = 7 * 24 * 3600; // 7 days

// ── Signed tokens ─────────────────────────────────────────────

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(pad + "=".repeat((4 - (pad.length % 4)) % 4), "base64");
}

export function signAdminAction(
  action: AdminAction,
  targetId: string
): string | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const payload = JSON.stringify({
    a: action,
    id: targetId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC,
  });
  const p = b64urlEncode(Buffer.from(payload, "utf8"));
  const sig = b64urlEncode(createHmac("sha256", secret).update(p).digest());
  return `${p}.${sig}`;
}

export function verifyAdminAction(
  token: string
): { action: AdminAction; id: string } | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const [p, sig] = token.split(".");
  if (!p || !sig) return null;
  const expected = b64urlEncode(createHmac("sha256", secret).update(p).digest());
  const a = b64urlDecode(sig);
  const b = b64urlDecode(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(p).toString("utf8"));
    if (typeof payload.a !== "string" || typeof payload.id !== "string")
      return null;
    if (typeof payload.exp !== "number") return null;
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;
    return { action: payload.a as AdminAction, id: payload.id };
  } catch {
    return null;
  }
}

async function siteOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`;
  } catch {
    /* headers() unavailable outside a request */
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://clipforge.vercel.app"
  );
}

export async function adminActionUrl(
  action: AdminAction,
  targetId: string
): Promise<string | null> {
  const t = signAdminAction(action, targetId);
  if (!t) return null;
  const origin = await siteOrigin();
  return `${origin}/api/admin/action?t=${encodeURIComponent(t)}`;
}

// ── Sending ───────────────────────────────────────────────────

let resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

/** Sends an admin email. Never throws — returns false on any failure. */
export async function sendAdminEmail(
  subject: string,
  html: string
): Promise<boolean> {
  const r = getResend();
  if (!r) {
    console.warn(`[admin-email] RESEND_API_KEY not set — skipped: ${subject}`);
    return false;
  }
  try {
    const { error } = await r.emails.send({
      from: "ClipForge Admin <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject,
      html,
    });
    if (error) {
      console.error("[admin-email] send failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[admin-email] send threw:", (e as Error).message);
    return false;
  }
}

// ── Templates ─────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** USD formatting — product currency is USD everywhere (no ₹/en-IN). */
export function formatUsd(n: number): string {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function btn(label: string, url: string | null, bg: string): string {
  if (!url) return "";
  return (
    `<a href="${url}" style="display:inline-block;padding:12px 26px;margin:8px 8px 8px 0;` +
    `background:${bg};color:#ffffff;text-decoration:none;border-radius:8px;` +
    `font-weight:600;font-size:15px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">${label}</a>`
  );
}

function shell(title: string, inner: string): string {
  return (
    `<div style="max-width:600px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111;">` +
    `<h2 style="font-size:20px;margin:0 0 16px;">${esc(title)}</h2>` +
    inner +
    `<p style="margin-top:24px;font-size:12px;color:#888;">Links expire in 7 days and stop working once the item is handled. ` +
    `No login needed — the link itself is your authorization. Do not forward these emails.</p></div>`
  );
}

export interface ClipNotifyItem {
  id: string;
  url: string;
  platform: string;
  handle: string;
  campaignName: string;
  clipperName: string;
}

/** One email per upload batch, with per-clip Approve / Reject buttons. */
export async function notifyClipsSubmitted(
  clips: ClipNotifyItem[]
): Promise<void> {
  if (clips.length === 0) return;
  const rows = await Promise.all(
    clips.map(async (c) => {
      const approve = await adminActionUrl("approve_clip", c.id);
      const reject = await adminActionUrl("reject_clip", c.id);
      return (
        `<div style="border:1px solid #e5e5e5;border-radius:10px;padding:14px;margin:0 0 12px;">` +
        `<div style="font-size:14px;margin-bottom:6px;"><strong>${esc(c.clipperName)}</strong> ` +
        `· ${esc(c.platform)}${c.handle ? ` · ${esc(c.handle)}` : ""} · ${esc(c.campaignName)}</div>` +
        `<div style="font-size:13px;margin-bottom:10px;word-break:break-all;">` +
        `<a href="${esc(c.url)}" style="color:#555;">${esc(c.url)}</a></div>` +
        btn("Approve", approve, "#111") +
        btn("Reject", reject, "#fff") +
        `</div>`
      );
    })
  );
  // Fix reject button contrast (white bg needs border + dark text).
  const html = shell(
    `${clips.length} clip${clips.length === 1 ? "" : "s"} awaiting review`,
    rows
      .join("")
      .replace(
        'background:#fff;color:#ffffff',
        "background:#fff;color:#111;border:1px solid #ccc"
      )
  );
  await sendAdminEmail(
    `[ClipForge] ${clips.length} clip${clips.length === 1 ? "" : "s"} to review`,
    html
  );
}

export async function notifyAccountVerification(input: {
  id: string;
  platform: string;
  handle: string;
  code: string;
  clipperName: string;
}): Promise<void> {
  const approve = await adminActionUrl("approve_account", input.id);
  const reject = await adminActionUrl("reject_account", input.id);
  const html = shell(
    "Account verification requested",
    `<p style="font-size:15px;"><strong>${esc(input.clipperName)}</strong> connected ` +
      `<strong>${esc(input.platform)}</strong> as <strong>${esc(input.handle)}</strong>.</p>` +
      `<p style="font-size:15px;">Verification code (should be in the bio): ` +
      `<code style="background:#f4f4f4;padding:3px 8px;border-radius:4px;font-size:15px;">${esc(input.code)}</code></p>` +
      `<p style="font-size:14px;color:#555;">Check the bio for the code and confirm 1,000+ followers, then:</p>` +
      btn("Approve", approve, "#111") +
      btn("Reject", reject, "#fff").replace(
        'background:#fff;color:#ffffff',
        "background:#fff;color:#111;border:1px solid #ccc"
      )
  );
  await sendAdminEmail("[ClipForge] Verify social account", html);
}

export async function notifyBrandRequest(input: {
  id: string;
  company: string;
  contact: string;
  email: string;
  website: string | null;
  budget: string;
  message: string | null;
}): Promise<void> {
  const approve = await adminActionUrl("approve_brand_request", input.id);
  const reject = await adminActionUrl("reject_brand_request", input.id);
  const html = shell(
    "New brand request",
    `<p style="font-size:15px;"><strong>${esc(input.company)}</strong> — ${esc(input.contact)} ` +
      `(${esc(input.email)})</p>` +
      (input.website
        ? `<p style="font-size:14px;">Website: <a href="${esc(input.website)}" style="color:#555;">${esc(input.website)}</a></p>`
        : "") +
      `<p style="font-size:14px;">Budget range: <strong>${esc(input.budget)}</strong></p>` +
      (input.message
        ? `<p style="font-size:14px;color:#444;">“${esc(input.message)}”</p>`
        : "") +
      btn("Approve", approve, "#111") +
      btn("Reject", reject, "#fff").replace(
        'background:#fff;color:#ffffff',
        "background:#fff;color:#111;border:1px solid #ccc"
      )
  );
  await sendAdminEmail(`[ClipForge] Brand request: ${input.company}`, html);
}

export async function notifyCampaignSubmitted(input: {
  id: string;
  name: string;
  brandName: string;
  ratePer100k: number;
  platforms: string[];
  budgetCap: number | null;
  brandBalance: number | null;
}): Promise<void> {
  const approve = await adminActionUrl("approve_campaign", input.id);
  const reject = await adminActionUrl("reject_campaign", input.id);
  const html = shell(
    "Campaign awaiting approval",
    `<p style="font-size:15px;"><strong>${esc(input.name)}</strong> by ${esc(input.brandName)}</p>` +
      `<p style="font-size:14px;">Rate: <strong>${formatUsd(input.ratePer100k)} / 100k views</strong>` +
      (input.budgetCap != null
        ? ` · Budget cap: ${formatUsd(input.budgetCap)}`
        : "") +
      `</p>` +
      `<p style="font-size:14px;">Current brand balance: <strong>${
        input.brandBalance != null ? formatUsd(input.brandBalance) : "unknown"
      }</strong></p>` +
      `<p style="font-size:14px;">Platforms: ${esc(input.platforms.join(", "))}</p>` +
      btn("Approve", approve, "#111") +
      btn("Reject", reject, "#fff").replace(
        'background:#fff;color:#ffffff',
        "background:#fff;color:#111;border:1px solid #ccc"
      )
  );
  await sendAdminEmail(`[ClipForge] Approve campaign: ${input.name}`, html);
}

/**
 * A brand asked (by email) to top up. One email per request, with a
 * "Record $X top-up" button. The signed token's id format is
 * `${brandId}|${amount}|${reference}` — parsed, validated and deduped by
 * doTopup in app/api/admin/action/route.ts.
 */
export async function notifyTopupRequest(input: {
  brandId: string;
  brandName: string;
  amount: number;
  reference: string;
}): Promise<void> {
  const tokenId = `${input.brandId}|${input.amount}|${input.reference}`;
  const recordUrl = await adminActionUrl("record_topup", tokenId);
  const html = shell(
    "Top-up request",
    `<p style="font-size:15px;"><strong>${esc(input.brandName)}</strong> requested a top-up of ` +
      `<strong>${formatUsd(input.amount)}</strong>.</p>` +
      `<p style="font-size:14px;">Reference: ` +
      `<code style="background:#f4f4f4;padding:3px 8px;border-radius:4px;font-size:14px;">${esc(input.reference)}</code></p>` +
      `<p style="font-size:14px;color:#555;">Once the funds have arrived, record the top-up so the brand's balance updates:</p>` +
      btn(`Record ${formatUsd(input.amount)} top-up`, recordUrl, "#111")
  );
  await sendAdminEmail(
    `[ClipForge] Top-up request: ${input.brandName} — ${formatUsd(input.amount)}`,
    html
  );
}

export interface PayoutReadyItem {
  id: string;
  clipperName: string;
  amount: number;
  views: number;
  clips: number;
  method: string | null;
}

/**
 * ONE batch email per closed payout cycle: every pending payout listed with
 * its own "Mark paid" button (signed mark_payout_paid token, id = payout row
 * id). The admin sends the money, then marks each row paid.
 */
export async function notifyPayoutsReady(input: {
  cycleId: string;
  cycleLabel: string;
  campaignName: string;
  payouts: PayoutReadyItem[];
}): Promise<void> {
  if (input.payouts.length === 0) return;
  const rows = await Promise.all(
    input.payouts.map(async (p) => {
      const markPaid = await adminActionUrl("mark_payout_paid", p.id);
      return (
        `<div style="border:1px solid #e5e5e5;border-radius:10px;padding:14px;margin:0 0 12px;">` +
        `<div style="font-size:14px;margin-bottom:4px;"><strong>${esc(p.clipperName)}</strong> — ` +
        `<strong>${formatUsd(p.amount)}</strong></div>` +
        `<div style="font-size:13px;color:#555;margin-bottom:10px;">` +
        `${Number(p.views).toLocaleString("en-US")} views · ${p.clips} clip${p.clips === 1 ? "" : "s"}` +
        (p.method ? ` · ${esc(p.method)}` : "") +
        `</div>` +
        btn("Mark paid", markPaid, "#111") +
        `</div>`
      );
    })
  );
  const html = shell(
    `Payouts ready: ${input.cycleLabel}`,
    `<p style="font-size:15px;"><strong>${esc(input.campaignName)}</strong> — ${esc(input.cycleLabel)} ` +
      `(${input.payouts.length} payout${input.payouts.length === 1 ? "" : "s"})</p>` +
      rows.join("") +
      `<p style="font-size:14px;color:#555;">Send the money, then mark each payout as paid. The clipper is notified automatically.</p>`
  );
  await sendAdminEmail(
    `[ClipForge] ${input.payouts.length} payout${input.payouts.length === 1 ? "" : "s"} ready: ${input.campaignName} — ${input.cycleLabel}`,
    html
  );
}
