import { getAllBrands, getRecentTopups } from "@/lib/admin-actions";
import TopupRecorder from "@/components/admin/TopupRecorder";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const [brands, topups] = await Promise.all([getAllBrands(), getRecentTopups()]);
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Billing</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Record manual brand top-ups after funds are received. Ledger only — no
          automated payments in v1.
        </p>
      </div>
      <TopupRecorder brands={brands} initial={topups} />
    </div>
  );
}
