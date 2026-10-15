import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client: bypasses RLS so admins can read/write rows belonging
 * to other users. Requires SUPABASE_SERVICE_ROLE_KEY.
 *
 * Plain module on purpose (NO "use server"): a "use server" file may only
 * export async functions, which breaks next build.
 */
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Admin panel is not configured: set SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key);
}
