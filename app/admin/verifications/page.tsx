import { getPendingVerifications } from "@/lib/admin-actions";
import VerificationsClient from "./VerificationsClient";

export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const pending = await getPendingVerifications();
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-3xl">Account verifications</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {pending.length} account{pending.length === 1 ? "" : "s"} waiting for review.
          </p>
        </div>
      </div>
      <VerificationsClient initial={pending} />
    </div>
  );
}
