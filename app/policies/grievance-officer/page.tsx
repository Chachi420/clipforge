import type { Metadata } from "next";
import { h2Cls, pCls, listCls } from "../styles";

/**
 * Set the real grievance officer email before launch.
 * Required under the IT Act 2000 and DPDP Act 2023 for platforms
 * operating in India.
 */
const GRIEVANCE_EMAIL = "REPLACE-BEFORE-LAUNCH";

export const metadata: Metadata = {
  title: "Grievance Officer — ClipForge",
  description:
    "How to raise a complaint with ClipForge's Grievance Officer under the IT Act 2000 and DPDP Act 2023.",
  alternates: { canonical: "/policies/grievance-officer" },
};

export default function GrievanceOfficerPage() {
  return (
    <article>
      <h1 className="display text-4xl">Grievance Officer</h1>
      <p className="mt-3 text-sm text-ink-faint">
        As required under the IT Act 2000 and the DPDP Act 2023
      </p>

      <p className={pCls}>
        If you have a complaint about content on ClipForge, how your data is handled,
        or any decision we&apos;ve made about your account, you can raise it directly
        with our Grievance Officer. We acknowledge every complaint within 24 hours
        and resolve it within 30 days of receipt.
      </p>

      <h2 className={h2Cls}>Grievance Officer details</h2>
      <ul className={listCls}>
        <li>
          <strong className="text-ink">Designation:</strong> Grievance Officer, ClipForge
        </li>
        <li>
          <strong className="text-ink">Email:</strong>{" "}
          <a
            href={`mailto:${GRIEVANCE_EMAIL}`}
            className="font-semibold text-electric-deep hover:underline"
          >
            {GRIEVANCE_EMAIL}
          </a>
        </li>
        <li>
          <strong className="text-ink">Acknowledgment:</strong> within 24 hours of receipt
        </li>
        <li>
          <strong className="text-ink">Resolution:</strong> within 30 days of receipt
        </li>
      </ul>

      <h2 className={h2Cls}>How to file a complaint</h2>
      <p className={pCls}>
        Email the Grievance Officer from the address tied to your ClipForge account and
        include:
      </p>
      <ul className={listCls}>
        <li>Your name and the email address on your ClipForge account.</li>
        <li>What happened, with dates — what you saw, what decision was made, or what content concerns you.</li>
        <li>Links to the relevant clips, campaigns, or pages where applicable.</li>
        <li>What outcome you&apos;re asking for.</li>
      </ul>
      <p className={pCls}>
        If we need more information to act on your complaint, we&apos;ll ask within the
        24-hour acknowledgment window. Complaints about illegal content are prioritized
        and handled in line with our obligations under Indian law.
      </p>

      <h2 className={h2Cls}>What happens next</h2>
      <ul className={listCls}>
        <li>
          <strong className="text-ink">Within 24 hours:</strong> you get an acknowledgment
          with a reference number for your complaint.
        </li>
        <li>
          <strong className="text-ink">Within 30 days:</strong> you get a decision and,
          where applicable, the action we&apos;ve taken.
        </li>
        <li>
          If your complaint concerns a payout, account suspension, or clip rejection,
          the decision will explain the specific reason and what you can do differently.
        </li>
      </ul>

      <h2 className={h2Cls}>Escalation</h2>
      <p className={pCls}>
        If you&apos;re not satisfied with the resolution, reply to the decision email with
        your reference number and the reason you disagree. It will be reviewed by a
        different member of the team, and you&apos;ll hear back within 15 days.
      </p>
    </article>
  );
}
