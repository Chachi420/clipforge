import { getPendingVerifications } from "@/lib/admin-actions";
import VerificationsClient from "./VerificationsClient";

export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const pending = await getPendingVerifications();
  return (
    <div className="space-y-6 px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Account verifications</h1>
          <p className="mt-1 text-sm text-white/50">
            {pending.length} account{pending.length === 1 ? "" : "s"} waiting for review.
          </p>
        </div>
      </div>
      <VerificationsClient initial={pending} />
    </div>
  );
}
