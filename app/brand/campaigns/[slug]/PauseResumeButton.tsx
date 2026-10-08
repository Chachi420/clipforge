"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { pauseCampaign, resumeCampaign } from "@/lib/brand-actions";
import type { CampaignStatus } from "@/lib/types";

export default function PauseResumeButton({
  campaignId,
  status,
}: {
  campaignId: string;
  status: CampaignStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (status !== "active" && status !== "paused") return null;

  async function handleClick() {
    setBusy(true);
    try {
      if (status === "active") await pauseCampaign(campaignId);
      else await resumeCampaign(campaignId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={status === "active" ? "outline" : "primary"}
      onClick={handleClick}
      disabled={busy}
    >
      {busy ? "…" : status === "active" ? "Pause campaign" : "Resume campaign"}
    </Button>
  );
}
