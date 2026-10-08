import Link from "next/link";
import { Plus } from "lucide-react";

/** Link styled exactly like the primary Button from components/ui. */
export default function NewCampaignButton() {
  return (
    <Link
      href="/brand/campaigns/new"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-soft"
    >
      <Plus size={16} />
      New campaign
    </Link>
  );
}
