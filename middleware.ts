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
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  const { data: { user } } = await supabase.auth.getUser();

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
