import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function authEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { url, anon };
}

export function isAuthConfigured() {
  const { url, anon } = authEnv();
  return Boolean(url && anon);
}

/**
 * Cookie-bound Supabase client for use in Server Components, Server Actions and
 * Route Handlers. Uses the public anon key — never the service role key.
 */
export async function createServerAuthClient() {
  const { url, anon } = authEnv();
  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore, the session is
          // refreshed in middleware instead.
        }
      },
    },
  });
}
