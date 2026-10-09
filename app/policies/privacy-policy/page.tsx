import type { Metadata } from "next";
import { h2Cls, pCls, listCls } from "../styles";

export const metadata: Metadata = {
  title: "Privacy Policy — ClipForge",
  description: "How ClipForge collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      <h1 className="display text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-ink-faint">Last updated: October 2026 · Beta policy</p>

      <h2 className={h2Cls}>What we collect</h2>
      <p className={pCls}>To run the marketplace, we collect:</p>
      <ul className={listCls}>
        <li>Account info: your name, email address, and profile details from Google or Microsoft OAuth sign-in.</li>
        <li>Connected social accounts: the handles you link, and the follower counts we check during verification.</li>
        <li>Clip URLs you submit, and the view metrics we read or count for those clips.</li>
        <li>Payout details you provide so we can send earnings (e.g. your chosen payout method).</li>
        <li>Basic usage logs we use to keep the service running and investigate abuse.</li>
      </ul>

      <h2 className={h2Cls}>How we use it</h2>
      <ul className={listCls}>
        <li>Operate the marketplace: accounts, campaigns, clip submissions, and dashboards.</li>
        <li>Verify account ownership and follower counts, and verify clip views.</li>
        <li>Process payouts and detect fraud or fake engagement.</li>
        <li>Contact you about your account, campaigns, and support requests.</li>
      </ul>
      <p className={pCls}>We don&apos;t use your data for advertising, and we don&apos;t sell it.</p>

      <h2 className={h2Cls}>Cookies</h2>
      <p className={pCls}>
        We use cookies only for authentication sessions — keeping you signed in and securing
        your account. We don&apos;t run third-party tracking or ad cookies.
      </p>

      <h2 className={h2Cls}>Data sharing</h2>
      <p className={pCls}>
        We don&apos;t sell your personal data. Data is shared only where necessary: with
        payout processors to send your earnings, and with the social platforms&apos; official
        APIs to verify views — both receive only what they need. We may also disclose data
        if required by law.
      </p>

      <h2 className={h2Cls}>Security</h2>
      <p className={pCls}>
        We protect data with industry-standard measures: encrypted connections, access
        controls on our database, and row-level security so users can only see their own
        records. No system is perfect, and as a beta product our security practices are still
        maturing — don&apos;t store anything here you couldn&apos;t afford to lose.
      </p>

      <h2 className={h2Cls}>Your rights &amp; deletion requests</h2>
      <p className={pCls}>
        You can update your profile at any time from your dashboard. To request a copy or
        deletion of your data, email{" "}
        <a href="mailto:support@clipforge.example" className="font-semibold text-electric-deep hover:underline">
          support@clipforge.example
        </a>{" "}
        from your account email. We&apos;ll respond within 2 business days. Note that we may
        retain records required for payout, tax, or fraud-prevention purposes.
      </p>

      <h2 className={h2Cls}>Beta note</h2>
      <p className={pCls}>
        ClipForge is in beta. This policy may change as the product evolves; we&apos;ll
        update the date above when it does.
      </p>
    </article>
  );
}
