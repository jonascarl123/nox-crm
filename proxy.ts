import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabaseServerAuthKey,
  getSupabaseUrl,
} from "@/lib/supabase/auth-env";

const PUBLIC_PATHS = ["/login"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const url = getSupabaseUrl();
  const authKey = getSupabaseServerAuthKey();

  // Auth not configured (missing Supabase URL or keys).
  if (!url || !authKey) {
    // In development, stay out of the way so the app is usable during setup.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[auth] Supabase auth keys not set — route protection is disabled."
      );
      return response;
    }
    // In production, fail closed: never expose data, send everyone to /login.
    if (!isPublic(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient(url, authKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Treat auth-service errors as "not signed in" rather than crashing.
    user = null;
  }

  if (!user && !isPublic(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/deals";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
