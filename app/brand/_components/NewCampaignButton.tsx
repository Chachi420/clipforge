import Link from "next/link";
import { Plus } from "lucide-react";

/** Link styled like the electric pill Button from components/ui. */
export default function NewCampaignButton() {
  return (
    <Link
      href="/brand/campaigns/new"
      className="pill bg-electric px-4 py-2 text-sm text-white shadow-card transition hover:bg-electric-soft"
    >
      <Plus size={16} />
      New campaign
    </Link>
  );
}
