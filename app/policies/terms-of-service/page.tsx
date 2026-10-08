import type { Metadata } from "next";
import { h2Cls, pCls, listCls } from "../styles";

export const metadata: Metadata = {
  title: "Terms of Service — ClipForge",
  description: "The terms governing use of the ClipForge clipping marketplace.",
};

export default function TermsOfServicePage() {
  return (
    <article>
      <h1 className="text-4xl font-black text-white">Terms of Service</h1>
      <p className="mt-3 text-sm text-white/40">Last updated: October 2026 · Beta terms</p>

      <h2 className={h2Cls}>1. The service</h2>
      <p className={pCls}>
        ClipForge is a marketplace that connects brands with clippers (content creators).
        Brands run pay-per-view campaigns; clippers post original short-form clips and earn
        based on verified views. The service is in beta: features, rates, and workflows may
        change, and some functionality may be unavailable while we iterate.
      </p>

      <h2 className={h2Cls}>2. Accounts &amp; eligibility</h2>
      <p className={pCls}>
        You must be at least 13 years old (or the minimum age required by your jurisdiction)
        to use ClipForge. Accounts are personal and non-transferable. You are responsible
        for keeping your sign-in credentials safe and for all activity under your account.
        Clippers are additionally bound by the Clipper Terms.
      </p>

      <h2 className={h2Cls}>3. Acceptable use</h2>
      <p className={pCls}>You agree not to:</p>
      <ul className={listCls}>
        <li>Use bots, click farms, paid engagement, or any artificial means to inflate views or followers.</li>
        <li>Submit clips you did not create, or re-upload other creators&apos; content.</li>
        <li>Attempt to disrupt, scrape at abusive scale, or reverse-engineer the platform.</li>
        <li>Misrepresent your identity, follower counts, or campaign performance.</li>
      </ul>
      <p className={pCls}>
        Fake engagement is grounds for immediate suspension or a permanent ban, and any
        earnings tied to fraudulent activity are forfeited.
      </p>

      <h2 className={h2Cls}>4. Payouts</h2>
      <p className={pCls}>
        Clippers earn per verified view at the rate stated on each campaign. View counts are
        verified against official platform data or a manual review queue — they are counted,
        never fabricated. Payouts are processed in cycles and each payout is subject to
        admin review before release. We may hold or cancel payouts while fraud is being
        investigated.
      </p>

      <h2 className={h2Cls}>5. Termination</h2>
      <p className={pCls}>
        Either side may close an account at any time. We may suspend or terminate accounts
        that violate these terms, engage in fraud, or abuse the platform. On termination,
        legitimate unpaid earnings from completed, verified cycles remain payable subject
        to review; earnings tied to fraudulent activity are forfeited.
      </p>

      <h2 className={h2Cls}>6. Liability &amp; beta disclaimer</h2>
      <p className={pCls}>
        ClipForge is provided &quot;as is&quot;, without warranties of any kind. Campaign
        budgets, view counts, and earnings are estimates until verified and paid. To the
        maximum extent permitted by law, we are not liable for indirect, incidental, or
        consequential damages arising from your use of the service. During beta, we may
        modify or discontinue features with or without notice.
      </p>

      <h2 className={h2Cls}>7. Changes to these terms</h2>
      <p className={pCls}>
        We may update these terms as the product evolves. Continued use of ClipForge after
        changes take effect constitutes acceptance of the updated terms.
      </p>
    </article>
  );
}
