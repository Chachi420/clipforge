"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog, inputCls } from "./ui";
import { uploadClips } from "@/lib/actions";

export default function UploadClipDialog({
  campaignId, campaignName, onClose,
}: {
  campaignId: string; campaignName: string; onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const urls = text.split("\n").map((l) => l.trim()).filter(Boolean);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const { inserted, heldForReview } = await uploadClips(campaignId, urls);
      onClose();
      router.refresh();
      if (heldForReview > 0) {
        alert(`${inserted} clip${inserted === 1 ? "" : "s"} uploaded. ${heldForReview} could not be matched to a verified account automatically and ${heldForReview === 1 ? "is" : "are"} pending review.`);
      }
    } catch (e: any) {
      setError(e.message ?? "Upload failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Upload clips" subtitle={campaignName} onClose={onClose}>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 5000))}
        placeholder={"Paste clip URLs here (one per line, up to 25)..."}
        className={inputCls}
      />
      <p className="mt-2 text-xs text-white/40">Supports TikTok, Instagram, YouTube, X.</p>
      {error && <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={urls.length === 0 || saving} onClick={submit}>
          {saving ? "Uploading…" : `Upload ${urls.length} clip${urls.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </Dialog>
  );
}
