"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Field, inputCls } from "@/components/ui";
import { updateBrandProfile } from "@/lib/brand-actions";
import { deleteAccountAction } from "@/lib/actions";
import type { Brand } from "@/lib/types";

export default function BrandSettingsForm({ brand }: { brand: Brand }) {
  const [name, setName] = useState(brand.name);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl);
  const [contactEmail, setContactEmail] = useState(brand.contactEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateBrandProfile({ name, logoUrl, contactEmail });
      setSuccess("Brand profile saved.");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <Card className="space-y-5 p-6">
      {error && (
        <p className="rounded-md bg-status-error/10 px-4 py-2.5 text-sm text-status-error">{error}</p>
      )}
      {success && (
        <p className="rounded-md bg-status-success/10 px-4 py-2.5 text-sm text-status-success">
          {success}
        </p>
      )}
      <Field label="Brand name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Inc."
        />
      </Field>
      <Field label="Logo URL (optional)">
        <input
          className={inputCls}
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
      </Field>
      <Field label="Contact email (optional)">
        <input
          className={inputCls}
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="you@brand.com"
          inputMode="email"
        />
      </Field>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </Card>
    {/* Danger Zone — brand account deletion (same flow as clipper side) */}
    <Card className="space-y-4 border-status-error/30 p-6">
      <h2 className="text-base font-semibold text-status-error">Danger Zone</h2>
      <p className="text-sm text-ink-soft">
        Permanently delete your brand account and all associated data — brand
        profile, campaigns, and clips. This cannot be undone.
      </p>
      {!confirmDelete ? (
        <Button
          variant="outline"
          onClick={() => setConfirmDelete(true)}
          className="border-status-error/40 text-status-error hover:bg-status-error/10"
        >
          Delete brand account
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">
            Type <span className="font-bold">DELETE</span> to confirm:
          </p>
          <input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className={`${inputCls} max-w-xs`}
            autoComplete="off"
          />
          <div className="flex gap-2">
            <form
              action={async () => {
                setDeleting(true);
                try {
                  await deleteAccountAction();
                } catch (e: any) {
                  // redirect() throws NEXT_REDIRECT on success — don't show as error
                  if (!e?.message?.includes("NEXT_REDIRECT")) {
                    setError(e.message ?? "Could not delete account.");
                    setDeleting(false);
                  }
                }
              }}
            >
              <Button
                type="submit"
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="bg-status-error text-white hover:bg-status-error/90 disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Yes, delete my brand account"}
              </Button>
            </form>
            <Button
              variant="ghost"
              onClick={() => { setConfirmDelete(false); setDeleteConfirmText(""); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
    </>
  );
}
