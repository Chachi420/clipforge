import { getAdminBrands } from "@/lib/admin-actions";
import BrandTable from "@/components/admin/BrandTable";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await getAdminBrands();
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Brands</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {brands.length} brand{brands.length === 1 ? "" : "s"} on the platform, with their campaigns and top-ups.
        </p>
      </div>
      <BrandTable initial={brands} />
    </div>
  );
}
