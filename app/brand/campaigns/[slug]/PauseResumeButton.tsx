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
  const [error, setError] = useState<string | null>(null);

  if (status !== "active" && status !== "paused") return null;

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      if (status === "active") await pauseCampaign(campaignId);
      else await resumeCampaign(campaignId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant={status === "active" ? "outline" : "primary"}
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? "…" : status === "active" ? "Pause campaign" : "Resume campaign"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}
