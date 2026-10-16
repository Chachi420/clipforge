import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  // Hard timeout on all Supabase calls: a stale/invalid session can make
  // the client hang for ~16s retrying, surfacing as a stuck loading screen.
  const fetchWithTimeout: typeof fetch = (url, init) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      auth: {
        // Server components only read the session; never try to refresh it.
        // Refresh attempts with stale/invalid tokens hang instead of failing.
        autoRefreshToken: false,
        persistSession: false,
      },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (
          toSet: { name: string; value: string; options?: CookieOptions }[]
        ) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
