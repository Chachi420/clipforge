import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function middleware(request: NextRequest) {
  // Demo mode (no Supabase configured): let everything through.
  if (!hasSupabase) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Safety net: if Supabase drops the OAuth code on a page other than the
  // callback (happens when the redirect URL isn't in the Supabase allowlist),
  // forward it so the login actually completes instead of stranding the user
  // on a page with a dead ?code= param.
  if (request.nextUrl.searchParams.has("code") && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Expose the pathname to server components (layouts can't read it directly).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Fetch with a hard timeout: a stale/invalid session (e.g. user deleted
  // server-side) makes Supabase's token refresh hang for ~16s, which shows
  // as a stuck loading screen. Fail fast instead.
  const fetchWithTimeout: typeof fetch = (url, init) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }[]) => {
          toSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Stale/broken session (e.g. user was deleted server-side): drop the
    // dead cookies so the visitor gets a clean logged-out state instead of
    // crashing or looping.
    user = null;
    for (const c of request.cookies.getAll()) {
      if (c.name.startsWith("sb-")) {
        request.cookies.delete(c.name);
        response.cookies.delete(c.name);
      }
    }
  }

  if (!user && (pathname.startsWith("/dashboard") ||
      (pathname.startsWith("/brand") && pathname !== "/brand/login"))) {
    const login = pathname.startsWith("/brand") ? "/brand/login" : "/login";
    return NextResponse.redirect(new URL(login, request.url));
  }
  // Logged-in users hitting the clipper login page go to their home.
  // Brand login is deliberately left alone: a logged-in non-brand user who
  // explicitly chose "sign in as a brand" gets an explanation + account
  // switcher on the page instead of a confusing silent redirect.
  if (user && pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const dest = (profile as any)?.role === "brand" ? "/brand" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }
  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/brand/:path*", "/brand/login"],
};
