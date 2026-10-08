import type { ReactNode } from "react";

export type DocsSection = {
  title: string;
  articles: { slug: string; title: string }[];
};

export type DocsArticle = {
  slug: string;
  section: string;
  title: string;
  body: ReactNode;
};

const h2 = "mt-8 text-xl font-bold text-white";
const p = "mt-3 leading-relaxed text-white/70";
const ul = "mt-3 list-disc space-y-2 pl-6 text-white/70 marker:text-accent-soft";
const ol = "mt-3 list-decimal space-y-2 pl-6 text-white/70 marker:font-bold marker:text-accent-soft";
const strong = "text-white";

export const DOCS_NAV: DocsSection[] = [
  {
    title: "Getting Started",
    articles: [
      { slug: "welcome", title: "Welcome to ClipForge" },
      { slug: "quickstart", title: "Quickstart: first payout" },
    ],
  },
  {
    title: "Accounts",
    articles: [{ slug: "connecting-verifying", title: "Connecting & verifying accounts" }],
  },
  {
    title: "Campaigns",
    articles: [{ slug: "browsing-campaigns", title: "Browsing & joining campaigns" }],
  },
  {
    title: "Clips",
    articles: [
      { slug: "submit-a-clip", title: "Submit a clip" },
      { slug: "tracking-views", title: "Tracking & view verification" },
    ],
  },
  {
    title: "Payments",
    articles: [{ slug: "payouts", title: "Payout methods & cycles" }],
  },
  {
    title: "Teams",
    articles: [{ slug: "teams", title: "Teams & commissions" }],
  },
  {
    title: "Settings",
    articles: [{ slug: "settings", title: "Profile & public page" }],
  },
];

export const DOCS_ARTICLES: DocsArticle[] = [
  {
    slug: "welcome",
    section: "Getting Started",
    title: "Welcome to ClipForge",
    body: (
      <>
        <p className={p}>
          ClipForge is a two-sided marketplace: brands run pay-per-view campaigns, and
          clippers post short videos about those campaigns on TikTok, Instagram Reels,
          YouTube Shorts, and X. Clippers earn for every verified view their clips get —
          no follower count required beyond account verification.
        </p>
        <h2 className={h2}>How it fits together</h2>
        <ul className={ul}>
          <li>
            <strong className={strong}>Campaigns</strong> — set by brands (or admins).
            Each shows its rate per 100K views, accepted platforms, view thresholds, and
            bounties.
          </li>
          <li>
            <strong className={strong}>Accounts</strong> — your social accounts, verified
            once via a code in your bio plus a 1,000-follower minimum.
          </li>
          <li>
            <strong className={strong}>Clips</strong> — your submitted posts. Views are
            re-scanned periodically and earnings accrue per campaign terms.
          </li>
          <li>
            <strong className={strong}>Payments</strong> — PayPal or crypto payouts after
            each cycle closes and views are verified.
          </li>
        </ul>
        <h2 className={h2}>Where to go next</h2>
        <p className={p}>
          New here? Start with the <strong className={strong}>Quickstart</strong> guide
          to reach your first payout, then read{" "}
          <strong className={strong}>Connecting &amp; verifying accounts</strong> — it&apos;s
          the one step everything else depends on.
        </p>
      </>
    ),
  },
  {
    slug: "quickstart",
    section: "Getting Started",
    title: "Quickstart: first payout",
    body: (
      <>
        <p className={p}>
          Five steps stand between you and your first payout. Most clippers complete the
          setup in under half an hour; the posting is the ongoing work.
        </p>
        <ol className={ol}>
          <li>
            <strong className={strong}>Sign in with Google.</strong> Head to the login
            page and sign in with your Google account. No fees, no application.
          </li>
          <li>
            <strong className={strong}>Verify one social account.</strong> In the
            dashboard, open Accounts, add the account you post from, and put the unique
            verification code in its bio. The checker confirms the code and a 1,000+
            follower count, then marks the account Active.
          </li>
          <li>
            <strong className={strong}>Join a campaign.</strong> Browse campaigns, check
            the rate per 100K views and the brief, and join one that fits your accounts.
          </li>
          <li>
            <strong className={strong}>Post and submit.</strong> Publish your clip, then
            paste the post URL into ClipForge. Submissions must come from a verified,
            Active account.
          </li>
          <li>
            <strong className={strong}>Add a payout method.</strong> In Payments, add
            PayPal or a crypto wallet (USDC/USDT) now — don&apos;t wait until a cycle is
            closing.
          </li>
        </ol>
        <p className={p}>
          Views are re-scanned on a schedule, so earnings may take a day to appear after
          you submit. Keep submitted posts public until the cycle closes and your views
          are verified.
        </p>
      </>
    ),
  },
  {
    slug: "connecting-verifying",
    section: "Accounts",
    title: "Connecting & verifying accounts",
    body: (
      <>
        <p className={p}>
          Before any clip you submit can earn, the account it was posted from must be
          verified. Verification proves you actually control the account and that
          it&apos;s a real, active presence — not a throwaway.
        </p>
        <h2 className={h2}>How verification works</h2>
        <ol className={ol}>
          <li>
            In the dashboard, go to <strong className={strong}>Accounts</strong> and add
            a social account (TikTok, Instagram, YouTube, or X) with its handle or URL.
          </li>
          <li>
            ClipForge issues a <strong className={strong}>unique verification code</strong>{" "}
            for that account.
          </li>
          <li>
            Put the code in the account&apos;s <strong className={strong}>bio</strong>{" "}
            (profile description). It can sit alongside your normal bio text.
          </li>
          <li>
            The verification checker looks for the code in your bio and confirms the
            account has <strong className={strong}>at least 1,000 followers</strong>.
          </li>
          <li>
            Once both checks pass, the account status flips to{" "}
            <strong className={strong}>Active</strong>. You can remove the code from your
            bio afterward, though leaving it is harmless.
          </li>
        </ol>
        <h2 className={h2}>Rules that matter</h2>
        <ul className={ul}>
          <li>Each verification code is unique to one account — don&apos;t reuse codes across accounts.</li>
          <li>Every clip URL you submit must come from an Active account, or it&apos;s rejected automatically.</li>
          <li>If your follower count drops below 1,000, the account may lose Active status until it recovers.</li>
          <li>You can connect multiple accounts across platforms; verify each one separately.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "browsing-campaigns",
    section: "Campaigns",
    title: "Browsing & joining campaigns",
    body: (
      <>
        <p className={p}>
          The Campaigns page in your dashboard lists every live campaign you&apos;re
          eligible for. Each campaign card shows the information you need to decide in
          seconds.
        </p>
        <h2 className={h2}>What to check before joining</h2>
        <ul className={ul}>
          <li>
            <strong className={strong}>Rate per 100K views</strong> — what each block of
            verified views pays. Higher isn&apos;t automatically better; compare against
            the view threshold.
          </li>
          <li>
            <strong className={strong}>Accepted platforms</strong> — only submit clips
            posted on the listed platforms, from your verified accounts on those
            platforms.
          </li>
          <li>
            <strong className={strong}>Minimum view threshold</strong> — a clip starts
            earning only after it passes this many views.
          </li>
          <li>
            <strong className={strong}>Bounties</strong> — flat bonuses for milestones
            like the week&apos;s top clip or hitting a view milestone.
          </li>
          <li>
            <strong className={strong}>The brief</strong> — what to show, what to say,
            required hashtags or mentions, and anything banned. Read it before filming.
          </li>
        </ul>
        <h2 className={h2}>Joining</h2>
        <p className={p}>
          Joining is one tap and free — you can be in multiple campaigns at once. After
          joining, the campaign appears in your dashboard with its brief and a submit
          box for clip URLs. There&apos;s no penalty for joining and posting nothing,
          but focus beats sprawl: two or three campaigns you post for consistently will
          outperform ten you joined and forgot.
        </p>
      </>
    ),
  },
  {
    slug: "submit-a-clip",
    section: "Clips",
    title: "Submit a clip",
    body: (
      <>
        <p className={p}>
          Submitting a clip tells ClipForge to start tracking a post&apos;s views. The
          flow is deliberately simple: paste the URL, and the system handles the rest.
        </p>
        <h2 className={h2}>The submission flow</h2>
        <ol className={ol}>
          <li>Post your clip on the platform, from one of your verified accounts.</li>
          <li>Copy the post&apos;s URL (the share link from the app works).</li>
          <li>
            In the dashboard, open the campaign and paste the URL into the submit box.
          </li>
          <li>
            ClipForge checks that the URL belongs to one of your{" "}
            <strong className={strong}>Active, verified accounts</strong>. If it
            doesn&apos;t, the submission is rejected — this is the most common reason
            submissions fail.
          </li>
          <li>
            Accepted clips show up on your Clips page with an initial view count and a
            tracking status.
          </li>
        </ol>
        <h2 className={h2}>Avoiding rejections</h2>
        <ul className={ul}>
          <li>Submit only from accounts showing as Active in your Accounts page.</li>
          <li>Match the campaign&apos;s accepted platforms — a TikTok URL won&apos;t count for a Reels-only campaign.</li>
          <li>Don&apos;t submit the same URL to two campaigns.</li>
          <li>Keep the post public. Deleted or privatized posts can&apos;t be verified and won&apos;t earn.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "tracking-views",
    section: "Clips",
    title: "Tracking & view verification",
    body: (
      <>
        <p className={p}>
          After you submit a clip, ClipForge re-scans its view count on a schedule —
          roughly daily — and records each reading. Your earnings for the clip are
          calculated from these verified readings, not from the number you see in the
          social app.
        </p>
        <h2 className={h2}>How view counts are verified</h2>
        <p className={p}>
          Where a platform offers an official API (YouTube does), view counts are pulled
          directly and recorded as snapshots over time. For platforms without an
          accessible API, views are counted through ClipForge&apos;s review process
          rather than estimated or fabricated — what you see in your dashboard is what
          was actually observed.
        </p>
        <h2 className={h2}>Tracking statuses</h2>
        <ul className={ul}>
          <li>
            <strong className={strong}>Tracking</strong> — the clip is being scanned
            normally and views are accruing.
          </li>
          <li>
            <strong className={strong}>Pending review</strong> — the clip needs a manual
            check (for example, the post may have been edited or the URL changed). It
            usually clears on its own; if it doesn&apos;t, make sure the post is still
            public.
          </li>
        </ul>
        <h2 className={h2}>What to expect</h2>
        <ul className={ul}>
          <li>New submissions can take up to a day to show their first verified reading.</li>
          <li>View counts update in steps, not live — check back after the next scan cycle.</li>
          <li>Earnings only start once a clip passes the campaign&apos;s minimum view threshold.</li>
          <li>Keep every submitted post public until the payout cycle closes and earnings are confirmed.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "payouts",
    section: "Payments",
    title: "Payout methods & cycles",
    body: (
      <>
        <p className={p}>
          Payouts run in cycles. When a cycle closes, your verified earnings are totaled
          and sent to your payout method after an admin review. Add your payout method
          early — it&apos;s the most common reason first payouts get delayed.
        </p>
        <h2 className={h2}>Supported payout methods</h2>
        <ul className={ul}>
          <li>
            <strong className={strong}>PayPal</strong> — add the email on your PayPal
            account in the Payments page.
          </li>
          <li>
            <strong className={strong}>Crypto (USDC / USDT)</strong> — add a wallet
            address. Double-check the address and network before saving; crypto payouts
            can&apos;t be reversed.
          </li>
        </ul>
        <h2 className={h2}>How a cycle works</h2>
        <ol className={ol}>
          <li>Your clips accrue earnings as verified views come in during the cycle.</li>
          <li>When the cycle closes, totals are locked and queued for review.</li>
          <li>
            An admin reviews the cycle — checking for invalid views or policy issues —
            and marks payouts as paid as they&apos;re sent.
          </li>
          <li>Your Payments page updates to show the payout and its status.</li>
        </ol>
        <h2 className={h2}>Good to know</h2>
        <ul className={ul}>
          <li>Campaigns may set a minimum payout amount; smaller balances roll into the next cycle.</li>
          <li>Earnings under review aren&apos;t final until the admin marks the cycle paid.</li>
          <li>Keep submitted posts public until the cycle closes — views can&apos;t be verified on posts the scanner can&apos;t see.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "teams",
    section: "Teams",
    title: "Teams & commissions",
    body: (
      <>
        <p className={p}>
          Teams let clippers organize under a captain — often an experienced clipper who
          shares what&apos;s working: which hooks are landing, which campaigns are paying
          reliably, which trends to ride. Joining a team is optional and never reduces
          your pay.
        </p>
        <h2 className={h2}>How commissions work</h2>
        <p className={p}>
          Captains earn a commission — a small percentage based on their team&apos;s
          total earnings. The commission comes out of the platform&apos;s side,{" "}
          <strong className={strong}>not out of your earnings</strong>. Your rate per
          view is exactly the same whether you&apos;re on a team or solo.
        </p>
        <h2 className={h2}>Joining and leaving</h2>
        <ul className={ul}>
          <li>Browse teams in the dashboard and request to join, or join via a captain&apos;s invite link.</li>
          <li>You can leave a team at any time from the Teams page.</li>
          <li>Earnings you made while on a team stay yours; commission only applies to earnings during your membership.</li>
        </ul>
        <h2 className={h2}>Running a team</h2>
        <p className={p}>
          Captains who consistently help their members earn tend to grow the fastest —
          active guidance (feedback on hooks, campaign picks, posting cadence) is what
          keeps members around. If you want to start a team, a track record of your own
          verified earnings is the best recruiting pitch you have.
        </p>
      </>
    ),
  },
  {
    slug: "settings",
    section: "Settings",
    title: "Profile & public page",
    body: (
      <>
        <p className={p}>
          Your Settings page controls your profile details, your public clipper page,
          and your session. Everything here is self-serve.
        </p>
        <h2 className={h2}>Profile</h2>
        <ul className={ul}>
          <li>Update your display name and avatar — this is what brands and other clippers see.</li>
          <li>Your login email is managed through your Google account and can&apos;t be changed here.</li>
        </ul>
        <h2 className={h2}>Public profile toggle</h2>
        <p className={p}>
          Every clipper gets a public profile page showing their verified accounts and
          performance. The <strong className={strong}>public toggle</strong> controls
          whether that page is visible to anyone with the link. Turn it off and your
          page returns a not-found; your dashboard, earnings, and payouts are unaffected.
          Turn it on when you want to share your profile — for example, when applying to
          a team or showing a brand your track record.
        </p>
        <h2 className={h2}>Signing out</h2>
        <p className={p}>
          Use the sign-out option in Settings to end your session on the current device.
          If you signed in on a shared computer, sign out when you&apos;re done — your
          clips keep tracking and your earnings keep accruing while you&apos;re logged
          out.
        </p>
      </>
    ),
  },
];

export function getDocsArticle(slug: string): DocsArticle | undefined {
  return DOCS_ARTICLES.find((a) => a.slug === slug);
}

export function getAllDocsSlugs(): string[] {
  return DOCS_ARTICLES.map((a) => a.slug);
}
