"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Field, inputCls } from "@/components/ui";
import { updateBrandProfile } from "@/lib/brand-actions";
import type { Brand } from "@/lib/types";

export default function BrandSettingsForm({ brand }: { brand: Brand }) {
  const [name, setName] = useState(brand.name);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl);
  const [contactEmail, setContactEmail] = useState(brand.contactEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    <Card className="space-y-5 p-6">
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-300">
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
  );
}
