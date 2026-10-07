"use client";
import { useState } from "react";
import { Button, Dialog, inputCls } from "./ui";

export default function UploadClipDialog({ campaignName, onClose }: { campaignName: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const urls = text.split("\n").map((l) => l.trim()).filter(Boolean);

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
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={urls.length === 0}
          onClick={() => {
            alert(`Demo mode: ${urls.length} clip URL(s) would be submitted for tracking.`);
            onClose();
          }}
        >
          Upload {urls.length} clip{urls.length === 1 ? "" : "s"}
        </Button>
      </div>
    </Dialog>
  );
}
