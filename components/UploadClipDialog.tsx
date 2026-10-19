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
  const [done, setDone] = useState<{ inserted: number; heldForReview: number } | null>(null);
  const router = useRouter();
  const urls = text.split("\n").map((l) => l.trim()).filter(Boolean);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const { inserted, heldForReview } = await uploadClips(campaignId, urls);
      setDone({ inserted, heldForReview });
    } catch (e: any) {
      setError(e.message ?? "Upload failed.");
    } finally {
      setSaving(false);
    }
  }

  function finish() {
    onClose();
    router.refresh();
  }

  if (done) {
    return (
      <Dialog title="Upload clips" subtitle={campaignName} onClose={finish}>
        <div className="rounded-card border border-status-success/25 bg-status-success/10 p-4 text-sm">
          <p className="font-semibold text-status-success">
            {done.inserted} clip{done.inserted === 1 ? "" : "s"} uploaded.
          </p>
          {done.heldForReview > 0 && (
            <p className="mt-1 text-ink-soft">
              {done.heldForReview} {done.heldForReview === 1 ? "is" : "are"} awaiting admin approval. Views start
              tracking once approved.
            </p>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={finish}>Done</Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title="Upload clips" subtitle={campaignName} onClose={onClose}>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 5000))}
        placeholder={"Paste clip URLs here (one per line, up to 25)..."}
        aria-label="Clip URLs, one per line"
        className={inputCls}
      />
      <p className="mt-2 text-xs text-ink-faint">Supports Instagram and YouTube.</p>
      {error && (
        <p role="alert" className="mt-3 rounded-card border border-status-error/25 bg-status-error/10 px-3 py-2 text-sm text-status-error">
          {error}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={urls.length === 0 || saving} onClick={submit}>
          {saving ? "Uploading…" : `Upload ${urls.length} clip${urls.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </Dialog>
  );
}
