import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabaseServerAuthKey,
  getSupabaseUrl,
  isAuthConfigured,
} from "@/lib/supabase/auth-env";

export { isAuthConfigured };

/**
 * Cookie-bound Supabase client for Server Components, Server Actions and
 * Route Handlers.
 */
export async function createServerAuthClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServerAuthKey();
  if (!url || !key) {
    throw new Error(
      "Missing Supabase URL or auth key (anon or service role)"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
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
          // refreshed in proxy instead.
        }
      },
    },
  });
}
