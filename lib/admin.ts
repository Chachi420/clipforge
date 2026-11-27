/**
 * Admin access — single source of truth.
 *
 * The admin panel is restricted to ONE Google account. There is no
 * role-based backdoor: `profiles.role = 'admin'` grants nothing.
 * The email comes from the Supabase auth session (Google OAuth),
 * which Google verifies, so it can't be spoofed by the user.
 */
export const ADMIN_EMAIL = "abhinavsingh7946@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email || "").trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * The email alone isn't enough: email+password sign-up is enabled on the
 * Supabase project (test accounts were created that way), so the address
 * must also be confirmed and the account must have signed in with Google,
 * which proves control of that Google account.
 */
export function isAdminUser(
  user:
    | {
        email?: string | null;
        email_confirmed_at?: string | null;
        app_metadata?: { provider?: string; providers?: string[] } | null;
      }
    | null
    | undefined
): boolean {
  if (!user || !isAdminEmail(user.email)) return false;
  if (!user.email_confirmed_at) return false;
  const providers = user.app_metadata?.providers ?? [user.app_metadata?.provider];
  return providers.includes("google");
}
