import { getAllBrands, getRecentTopups } from "@/lib/admin-actions";
import TopupRecorder from "@/components/admin/TopupRecorder";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const [brands, topups] = await Promise.all([getAllBrands(), getRecentTopups()]);
  return (
    <div className="space-y-6 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-white/50">
          Record manual brand top-ups after funds are received. Ledger only — no
          automated payments in v1.
        </p>
      </div>
      <TopupRecorder brands={brands} initial={topups} />
    </div>
  );
}
