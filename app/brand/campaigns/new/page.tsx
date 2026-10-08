import { requireBrand } from "@/lib/brand-actions";
import CampaignBriefForm from "@/components/brand/CampaignBriefForm";

export const dynamic = "force-dynamic";

export default async function NewCampaignBriefPage() {
  await requireBrand();
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <div>
        <h1 className="display text-3xl">New campaign brief</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Submit a brief — our team reviews and approves it (usually within 24h).
        </p>
      </div>
      <CampaignBriefForm />
    </div>
  );
}
