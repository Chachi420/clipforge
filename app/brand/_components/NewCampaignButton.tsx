import Link from "next/link";
import { Plus } from "lucide-react";

/** Link styled like the lime pill Button from components/ui. */
export default function NewCampaignButton() {
  return (
    <Link
      href="/brand/campaigns/new"
      className="pill bg-lime px-4 py-2 text-sm text-ink shadow-card transition hover:bg-lime-soft"
    >
      <Plus size={16} />
      New campaign
    </Link>
  );
}
