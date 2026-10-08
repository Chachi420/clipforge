import type { Metadata } from "next";
import { h2Cls, pCls, listCls } from "../layout";

export const metadata: Metadata = {
  title: "Clipper Terms — ClipForge",
  description: "The terms for clippers earning on ClipForge: verification, content rules, and payouts.",
};

export default function ClipperTermsPage() {
  return (
    <article>
      <h1 className="text-4xl font-black text-white">Clipper Terms</h1>
      <p className="mt-3 text-sm text-white/40">Last updated: October 2026 · Beta terms</p>
      <p className={pCls}>
        These terms apply to everyone earning as a clipper on ClipForge, on top of the
        general Terms of Service.
      </p>

      <h2 className={h2Cls}>1. Who can join</h2>
      <p className={pCls}>
        Anyone of eligible age with at least one qualifying social account can become a
        clipper. You join campaigns voluntarily, and each campaign&apos;s brief — rate per
        100K views, content guidelines, and deadlines — is the agreement for that campaign.
      </p>

      <h2 className={h2Cls}>2. Account verification</h2>
      <p className={pCls}>Before you can submit clips, each social account must be verified:</p>
      <ul className={listCls}>
        <li>Adding an account issues a unique verification code — place it in that account&apos;s bio.</li>
        <li>Our checker confirms the code is present and that the account has at least 1,000 followers.</li>
        <li>Clip links are only accepted from your verified, Active accounts (X, TikTok, Instagram, YouTube Shorts).</li>
        <li>Removing the code or dropping below the follower minimum can return the account to unverified.</li>
      </ul>

      <h2 className={h2Cls}>3. Content rules</h2>
      <ul className={listCls}>
        <li>Only submit original edits you made. Re-uploading other creators&apos; clips is prohibited.</li>
        <li>Follow each campaign&apos;s creative brief and content guidelines.</li>
        <li>Keep submitted posts public until the payout cycle closes — private or deleted posts can&apos;t be verified, and the earnings may be lost.</li>
        <li>Don&apos;t post content that is unlawful, hateful, or violates the platform&apos;s own rules.</li>
      </ul>

      <h2 className={h2Cls}>4. View verification &amp; anti-fraud</h2>
      <p className={pCls}>
        Earnings are based on verified views only. We read official view counts where
        platform APIs allow, and count the rest through a manual review queue — views are
        never fabricated or estimated. Bot engagement, purchased views, engagement pods, or
        any artificial inflation is fraud: it leads to an immediate ban and forfeiture of
        all associated earnings.
      </p>

      <h2 className={h2Cls}>5. Payouts</h2>
      <ul className={listCls}>
        <li>You earn the campaign&apos;s stated rate per 100K verified views.</li>
        <li>Earnings accrue during the campaign and are paid out in cycles.</li>
        <li>Every payout passes admin review before release, which can take a few business days.</li>
        <li>Payouts may be held while fraud is investigated; fraudulent earnings are forfeited.</li>
      </ul>

      <h2 className={h2Cls}>6. Team commissions</h2>
      <p className={pCls}>
        If you belong to a clipper team, the team&apos;s agreed commission is deducted from
        your earnings and paid to the team. Commission rates are set by the team and shown
        to you before you join — leaving a team stops future commissions but doesn&apos;t
        change already-processed payouts.
      </p>

      <h2 className={h2Cls}>7. Changes</h2>
      <p className={pCls}>
        As a beta product, these terms may change. We&apos;ll update the date above when
        they do; continued clipping after a change means you accept it.
      </p>
    </article>
  );
}
