import { getPendingBrandRequests } from "@/lib/admin-actions";
import BrandRequestQueue from "@/components/admin/BrandRequestQueue";

export const dynamic = "force-dynamic";

export default async function BrandRequestsPage() {
  const pending = await getPendingBrandRequests();
  return (
    <div className="space-y-6 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Brand access requests</h1>
        <p className="mt-1 text-sm text-white/50">
          {pending.length} request{pending.length === 1 ? "" : "s"} awaiting review. Approving
          provisions the brand account instantly.
        </p>
      </div>
      <BrandRequestQueue initial={pending} />
    </div>
  );
}
