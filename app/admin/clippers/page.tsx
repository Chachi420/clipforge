import { getAdminClippers } from "@/lib/admin-actions";
import ClipperTable from "@/components/admin/ClipperTable";

export const dynamic = "force-dynamic";

export default async function AdminClippersPage() {
  const clippers = await getAdminClippers();
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Clippers</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {clippers.length} clipper{clippers.length === 1 ? "" : "s"} on the platform. Click a name for their accounts, clips, and payouts.
        </p>
      </div>
      <ClipperTable initial={clippers} />
    </div>
  );
}
