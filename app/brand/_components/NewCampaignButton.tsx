import Link from "next/link";
import { Plus } from "lucide-react";

/** Primary link-button — matches the Button primary style from components/ui. */
export default function NewCampaignButton() {
  return (
    <Link
      href="/brand/campaigns/new"
      className="pill min-h-[44px] bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink-soft"
    >
      <Plus size={16} aria-hidden />
      New campaign
    </Link>
  );
}
