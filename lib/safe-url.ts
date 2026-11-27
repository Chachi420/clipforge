/**
 * User-supplied URLs (clip links, brand source material, logos, websites)
 * must never become `javascript:` / `data:` links. React 18 renders those
 * hrefs as-is, so a stored `javascript:` URL runs in whoever clicks it —
 * including the admin while reviewing.
 */

/** True for absolute http(s) URLs only. */
export function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Use for every href/src built from stored data: unsafe values render as no link. */
export function safeHref(value: string | null | undefined): string | undefined {
  return isHttpUrl(value) ? value!.trim() : undefined;
}

/** Server-side input check: empty -> null, http(s) -> trimmed, anything else throws. */
export function cleanOptionalUrl(value: string | null | undefined, label: string): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  if (!isHttpUrl(v)) throw new Error(`${label} must be a full link starting with https://`);
  return v;
}
