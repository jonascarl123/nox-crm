/** Supabase project URL (public or server env). */
export function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim() ??
    ""
  );
}

/** Public anon key — required for browser-side Supabase client. */
export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim() ??
    ""
  );
}

/**
 * Key for server-side auth (proxy, server actions, cookie sessions).
 * Prefers anon; falls back to service role so login works when only
 * SUPABASE_SERVICE_ROLE_KEY is set on Vercel.
 */
export function getSupabaseServerAuthKey() {
  return (
    getSupabaseAnonKey() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  );
}

export function isAuthConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServerAuthKey());
}
