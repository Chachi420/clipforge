import type { ReactNode } from "react";

export type BlogCategory = "Getting Started" | "Earnings" | "Platform Guides" | "Tools";

export type BlogPost = {
  slug: string;
  title: string;
  category: BlogCategory;
  readTime: string;
  excerpt: string;
  content: ReactNode;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Getting Started",
  "Earnings",
  "Platform Guides",
  "Tools",
];

const h2 = "mt-10 text-2xl font-bold text-white";
const p = "mt-4 leading-relaxed text-white/70";
const ul = "mt-4 list-disc space-y-2 pl-6 text-white/70 marker:text-accent-soft";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-become-a-clipper",
    title: "How to Become a Clipper (and Get Your First Payout)",
    category: "Getting Started",
    readTime: "6 min read",
    excerpt:
      "What clipping actually is, the six-step path from sign-up to payout, and why you don't need a big following — or even a computer — to start.",
    content: (
      <>
        <p className={p}>
          Clipping is simple: brands want short videos about their products on TikTok,
          Instagram Reels, YouTube Shorts, and X. Instead of paying influencers with big
          followings, they pay <em>clippers</em> — everyday creators — for every verified
          view their clips get. You find a campaign, post clips about it, and earn as the
          views roll in. No brand deals to negotiate, no audience required.
        </p>
        <h2 className={h2}>The path from sign-up to payout</h2>
        <p className={p}>
          On ClipForge the whole loop looks like this:
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-white/70 marker:font-bold marker:text-accent-soft">
          <li>
            <strong className="text-white">Sign up.</strong> Create your account with
            Google — it takes under a minute and there is no fee to join.
          </li>
          <li>
            <strong className="text-white">Verify your accounts.</strong> Add the social
            accounts you post from (TikTok, Instagram, YouTube, X). ClipForge gives you a
            unique verification code to put in each account&apos;s bio; a bot checks the
            bio for the code and confirms the account has at least 1,000 followers. Once
            verified, the account shows as Active.
          </li>
          <li>
            <strong className="text-white">Join a campaign.</strong> Browse live campaigns
            in the dashboard. Each one shows its rate per 100K views, the platforms it
            accepts, and any bounties — join the ones that fit your accounts.
          </li>
          <li>
            <strong className="text-white">Post your clips.</strong> Make short videos
            about the campaign following its brief (what to show, what to say, what to
            avoid).
          </li>
          <li>
            <strong className="text-white">Submit the URL.</strong> Paste the link to each
            published post into ClipForge. It has to come from one of your Active,
            verified accounts — links from unverified accounts are rejected automatically.
          </li>
          <li>
            <strong className="text-white">Earn.</strong> Views are re-scanned
            periodically and your earnings climb as they come in. When a payout cycle
            closes and views are verified, your payout goes out via PayPal or crypto.
          </li>
        </ol>
        <h2 className={h2}>You don&apos;t need a big following</h2>
        <p className={p}>
          This is the part most people get wrong. You are paid per verified view, not per
          follower — a clip from a small account that the algorithm picks up can
          out-earn a clip from a large one. The 1,000-follower minimum exists so brands
          know the account is real and active, not a throwaway; beyond that, it&apos;s
          the clip&apos;s performance that matters, not your follower count.
        </p>
        <h2 className={h2}>Phone-only is completely fine</h2>
        <p className={p}>
          You do not need a computer, a camera, or paid software. A phone, the free
          version of an editor like CapCut, and the social apps you already use are
          enough to produce clips that earn. Most beginners film, edit, post, and submit
          everything from one device.
        </p>
        <h2 className={h2}>What to do this week</h2>
        <ul className={ul}>
          <li>Sign in and verify at least one account so it shows as Active.</li>
          <li>Join one campaign and read its brief twice before filming.</li>
          <li>Post your first clip, submit the URL, and watch the view tracking page.</li>
          <li>Add a payout method (PayPal or crypto) now so nothing blocks your first payout.</li>
        </ul>
        <p className={p}>
          Your first clip probably won&apos;t go viral — almost nobody&apos;s does.
          Treat the first few weeks as reps: learn what hooks hold attention, which
          campaigns fit your style, and how the dashboard tracks your views. The clippers
          who stick around past the awkward first ten clips are the ones who start
          seeing real payouts.
        </p>
      </>
    ),
  },
  {
    slug: "how-much-do-clippers-make",
    title: "How Much Do Clippers Actually Make?",
    category: "Earnings",
    readTime: "7 min read",
    excerpt:
      "Real industry rate ranges per 100K views, how minimum view thresholds and bounties work, and an honest look at the timeline to your first real payout.",
    content: (
      <>
        <p className={p}>
          The honest answer: it varies enormously. Some clippers earn pocket money, some
          earn a serious side income, and a small number earn a full-time living. What
          you make depends on the campaigns you join, how many clips you post, and —
          most of all — how many views those clips get. This guide lays out the real
          mechanics so you can set expectations that match reality.
        </p>
        <h2 className={h2}>Rate tiers: what campaigns pay per 100K views</h2>
        <p className={p}>
          ClipForge campaigns price payouts per 100,000 verified views. Across the
          industry, rates tend to fall into rough bands. These are <strong className="text-white">ranges, not promises</strong> — every
          campaign sets its own rate, and the rate is shown up front before you join:
        </p>
        <ul className={ul}>
          <li>
            <strong className="text-white">$10–30 per 100K views — entry tier.</strong>{" "}
            High-volume campaigns from smaller brands. Easy briefs, lots of competition.
          </li>
          <li>
            <strong className="text-white">$30–75 per 100K views — standard tier.</strong>{" "}
            The most common band. Established brands with real budgets and clear briefs.
          </li>
          <li>
            <strong className="text-white">$75–150 per 100K views — premium tier.</strong>{" "}
            Bigger brands, stricter briefs, sometimes niche audiences or specific
            platforms.
          </li>
          <li>
            <strong className="text-white">$150–300+ per 100K views — high-paying tier.</strong>{" "}
            Rare. Usually time-limited pushes, launches, or campaigns that need a very
            specific style of clip.
          </li>
        </ul>
        <h2 className={h2}>Minimum view thresholds</h2>
        <p className={p}>
          Most campaigns set a minimum view threshold — a clip only starts earning after
          it passes, say, 1,000 or 10,000 views. This exists because brands pay for
          reach, and a clip with 40 views delivered none. Check the threshold before you
          join: a high rate with a sky-high threshold can earn you less than a modest
          rate with a low one.
        </p>
        <h2 className={h2}>Bounties: bonuses on top of view pay</h2>
        <p className={p}>
          Many campaigns add bounties — flat bonuses for specific achievements, like the
          first clip to hit 1M views, the best-performing clip of the week, or hitting a
          posting streak. Bounties are where a single standout clip can pay
          disproportionately well, and they&apos;re always listed on the campaign page
          before you join.
        </p>
        <h2 className={h2}>Team commissions</h2>
        <p className={p}>
          If you join a team, your captain earns a commission on the team&apos;s
          earnings — a small percentage that comes out of the platform&apos;s side, not
          out of your cut. Being on a good team doesn&apos;t reduce your pay, and teams
          often share what&apos;s working: which hooks are landing, which campaigns are
          paying reliably, which trends to ride.
        </p>
        <h2 className={h2}>A realistic timeline</h2>
        <p className={p}>
          Here&apos;s the part most guides skip: <strong className="text-white">most beginners won&apos;t make thousands in
          month one.</strong> A realistic first month looks like learning the dashboard,
          posting your first 10–20 clips, and seeing a handful of them cross their view
          thresholds — maybe your first small payout, maybe not yet. Clippers who treat
          it like a skill — studying which of their clips hold attention past the first
          two seconds, doubling down on what works — tend to see earnings compound over
          months two and three as their clip library and instincts grow.
        </p>
        <p className={p}>
          The math that matters is views × rate. Ten clips averaging 50K views on a
          $50-per-100K campaign is $250. One clip hitting 2M views on the same campaign
          is $1,000. Volume gives you more shots on goal; quality raises the ceiling.
          Aim for both, but if you&apos;re starting out, volume first — you can&apos;t
          learn what works without reps.
        </p>
      </>
    ),
  },
  {
    slug: "best-editing-tools-for-clippers",
    title: "The Best Editing Tools for Clippers (Most Are Free)",
    category: "Tools",
    readTime: "5 min read",
    excerpt:
      "CapCut, DaVinci Resolve, InShot, and Premiere compared honestly — plus the three things that actually make clips earn, regardless of which app you use.",
    content: (
      <>
        <p className={p}>
          New clippers often assume they need expensive software. You don&apos;t. The
          clips that earn are the ones with strong hooks, clean pacing, and readable
          captions — all achievable with free tools. Here&apos;s an honest rundown of
          what to use and when.
        </p>
        <h2 className={h2}>CapCut — the default choice (free)</h2>
        <p className={p}>
          CapCut is what most clippers actually use, and for good reason: it&apos;s free,
          runs on phones and desktops, has auto-captions that are genuinely good, and
          ships with templates and trending effects that match what&apos;s already
          working on TikTok and Reels. If you&apos;re starting out, start here — it
          removes every excuse between an idea and a posted clip.
        </p>
        <h2 className={h2}>DaVinci Resolve — free and pro-grade</h2>
        <p className={p}>
          If you want desktop power without paying for it, DaVinci Resolve&apos;s free
          tier is astonishingly capable: proper color grading, keyframing, and clean
          exports. The learning curve is steeper than CapCut&apos;s, so it&apos;s best
          for clippers who enjoy the craft and want finer control over motion graphics
          and pacing. Overkill for talking-head clips; great for highly edited,
          effects-heavy content.
        </p>
        <h2 className={h2}>InShot — quick mobile edits (free with watermark options)</h2>
        <p className={p}>
          InShot is the lightweight option: trim, captions, music, and 9:16 canvas
          handling in about ninety seconds. It&apos;s ideal when you&apos;re turning
          around lots of simple clips and don&apos;t need templates or effects. The free
          tier works; just check your export settings so the watermark doesn&apos;t end
          up in a clip you submit.
        </p>
        <h2 className={h2}>Premiere Pro — the paid pro option</h2>
        <p className={p}>
          Adobe Premiere Pro is the industry standard for a reason, but it&apos;s a
          monthly subscription and overkill for most clipping. Consider it only if
          you&apos;re already fast in it or you&apos;re producing high-volume,
          template-driven content where its automation and presets save real time.
        </p>
        <h2 className={h2}>What actually matters (more than the app)</h2>
        <ul className={ul}>
          <li>
            <strong className="text-white">Captions, always.</strong> Most short-form
            video is watched on mute. Burned-in captions keep viewers watching — and
            watch time is what the algorithms reward.
          </li>
          <li>
            <strong className="text-white">A hook in the first 2 seconds.</strong> The
            opening frame and first line decide whether someone swipes. State the payoff,
            ask the question, or show the surprising moment up front.
          </li>
          <li>
            <strong className="text-white">Pacing: cut the dead air.</strong> Remove
            pauses, ums, and slow intros. A 20-second clip should feel like it
            couldn&apos;t be 18.
          </li>
          <li>
            <strong className="text-white">Native 9:16.</strong> Film and export vertical
            at 1080×1920. Letterboxed or sideways clips look amateur and get
            skipped.
          </li>
        </ul>
        <p className={p}>
          Pick one editor, learn its keyboard shortcuts and caption workflow, and then
          stop shopping for tools. The clippers earning the most aren&apos;t winning on
          software — they&apos;re winning on reps, hooks, and reading what the data
          tells them about their own clips.
        </p>
      </>
    ),
  },
  {
    slug: "tiktok-clipper-guide",
    title: "The TikTok Clipper's Playbook",
    category: "Platform Guides",
    readTime: "6 min read",
    excerpt:
      "Why TikTok is the highest-upside platform for clippers, how posting cadence and sounds work, and the one rule that protects your payout.",
    content: (
      <>
        <p className={p}>
          Of the four platforms ClipForge supports, TikTok has the highest upside for
          clippers starting from zero. Its recommendation system will show a brand-new
          account&apos;s video to thousands of strangers if the video performs — no
          follower base required. That discovery engine is exactly what pay-per-view
          clipping rewards.
        </p>
        <h2 className={h2}>Why TikTok first</h2>
        <p className={p}>
          On follower-based platforms, reach follows audience size. On TikTok, reach
          follows watch time and completion rate: if strangers watch your clip to the
          end, TikTok shows it to more strangers. A clipper with 1,200 followers can
          absolutely land a million-view clip. That&apos;s the whole game — and it&apos;s
          why TikTok campaigns are usually the most competitive and the most lucrative
          to crack.
        </p>
        <h2 className={h2}>Posting cadence: consistency beats bursts</h2>
        <p className={p}>
          Post one to three clips per day per account rather than dumping ten at once.
          Each post gets its own initial test audience, so spreading posts out gives
          every clip a fair shot and gives you daily feedback on what&apos;s landing.
          Skipping days is fine; vanishing for weeks and returning with a flood is not —
          the algorithm favors accounts with a steady rhythm.
        </p>
        <h2 className={h2}>Hooks: the first two seconds are the clip</h2>
        <p className={p}>
          TikTok decides a video&apos;s fate fast. Open with the payoff, the boldest
          claim, or the most visual moment — then deliver on it. &ldquo;This app paid me
          $200 for one video&rdquo; beats &ldquo;Hey guys, so today I wanted to talk
          about…&rdquo; every time. Write the hook before you film, and if the first
          version doesn&apos;t hold retention, re-cut the opening rather than
          re-filming the whole thing.
        </p>
        <h2 className={h2}>Sounds and trends: ride, don&apos;t copy</h2>
        <p className={p}>
          Trending sounds get a discovery boost, so check TikTok&apos;s trend
          discovery weekly and use sounds that fit your campaign&apos;s brief. But
          don&apos;t just copy a trending format wholesale — adapt it to the product.
          The clips that earn are the ones where the trend serves the message, not the
          ones where the message is duct-taped onto a trend. Always read the campaign
          brief first: some brands ban specific trends or require original audio.
        </p>
        <h2 className={h2}>Keep posts public until payout</h2>
        <p className={p}>
          This is the rule that protects your money: <strong className="text-white">do not delete, privatize, or
          unlist a submitted clip until the payout cycle closes.</strong> ClipForge
          re-scans views periodically to verify earnings, and a clip it can&apos;t see
          is a clip it can&apos;t pay you for. Leave every submitted post public until
          the earnings are confirmed in your dashboard.
        </p>
        <h2 className={h2}>A starter checklist</h2>
        <ul className={ul}>
          <li>Verify your TikTok account (code in bio + 1,000 followers) before posting for campaigns.</li>
          <li>Read the campaign brief — allowed content, banned content, required hashtags or mentions.</li>
          <li>Film vertical, caption everything, hook in the first 2 seconds.</li>
          <li>Post 1–3x daily, submit each URL from your verified account.</li>
          <li>Leave posts public until the cycle closes and views are verified.</li>
        </ul>
      </>
    ),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
