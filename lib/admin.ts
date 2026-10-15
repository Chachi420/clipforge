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

export function isAdminUser(
  user: { email?: string | null } | null | undefined
): boolean {
  return !!user && isAdminEmail(user.email);
}
