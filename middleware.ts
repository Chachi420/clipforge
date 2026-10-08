import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function middleware(request: NextRequest) {
  // Demo mode (no Supabase configured): let everything through.
  if (!hasSupabase) return NextResponse.next();

  const response = NextResponse.next({ request });
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

  const { pathname } = request.nextUrl;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/brand"))) {
    const login = pathname.startsWith("/brand") ? "/brand/login" : "/login";
    return NextResponse.redirect(new URL(login, request.url));
  }
  // Logged-in users hitting a login page go to their home.
  if (user && (pathname === "/login" || pathname === "/brand/login")) {
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
  matcher: ["/dashboard/:path*", "/login", "/brand/:path*", "/brand/login"],
};
