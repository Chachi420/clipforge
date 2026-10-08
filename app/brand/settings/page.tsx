import { requireBrand } from "@/lib/brand-actions";
import BrandSettingsForm from "@/components/brand/BrandSettingsForm";

export const dynamic = "force-dynamic";

export default async function BrandSettingsPage() {
  const { brand } = await requireBrand();
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your brand profile. This is how your brand appears to our team.
        </p>
      </div>
      <BrandSettingsForm brand={brand} />
    </div>
  );
}
