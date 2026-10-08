import { getPendingBrandRequests } from "@/lib/admin-actions";
import BrandRequestQueue from "@/components/admin/BrandRequestQueue";

export const dynamic = "force-dynamic";

export default async function BrandRequestsPage() {
  const pending = await getPendingBrandRequests();
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Brand access requests</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {pending.length} request{pending.length === 1 ? "" : "s"} awaiting review. Approving
          provisions the brand account instantly.
        </p>
      </div>
      <BrandRequestQueue initial={pending} />
    </div>
  );
}
