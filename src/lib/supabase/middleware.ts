import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { redirectPathForRole } from "@/src/lib/auth/redirects";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/src/lib/supabase/env";
import { REMEMBER_ME_COOKIE, REMEMBER_ME_MAX_AGE } from "@/src/lib/supabase/session";

function isProtectedAdmin(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isProtectedOwner(pathname: string) {
  return (
    pathname === "/espace-proprietaire" ||
    pathname.startsWith("/espace-proprietaire/")
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const rememberMe = request.cookies.get(REMEMBER_ME_COOKIE)?.value === "1";
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              rememberMe
                ? {
                    ...options,
                    maxAge: REMEMBER_ME_MAX_AGE,
                  }
                : options
            )
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/redirect" : "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/redirect";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (isProtectedAdmin(pathname) || isProtectedOwner(pathname))
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (isProtectedAdmin(pathname) && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = redirectPathForRole(role);
      return NextResponse.redirect(url);
    }

    if (isProtectedOwner(pathname) && role !== "owner") {
      const url = request.nextUrl.clone();
      url.pathname = redirectPathForRole(role);
      return NextResponse.redirect(url);
    }
  }

  if (
    !user &&
    (isProtectedAdmin(pathname) || isProtectedOwner(pathname))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
