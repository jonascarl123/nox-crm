import "server-only";
import { isAuthConfigured } from "@/lib/supabase/auth-env";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { createServerSupabase } from "@/lib/supabase/server";

export type Role = "admin" | "member";

export type SessionProfile = {
  id: string;
  email: string;
  role: Role;
  fullName: string | null;
};

export async function getSessionUser() {
  if (!isAuthConfigured()) return null;
  try {
    const supabase = await createServerAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<SessionProfile | null> {
  const user = await getSessionUser();
  if (!user) return null;

  // Profiles are read with the service-role client (RLS-exempt) so the lookup
  // works the same in middleware, layouts and server actions.
  try {
    const admin = createServerSupabase();
    const { data } = await admin
      .from("profiles")
      .select("id, email, role, full_name")
      .eq("id", user.id)
      .single();

    if (data) {
      return {
        id: data.id as string,
        email: data.email as string,
        role: (data.role as Role) ?? "member",
        fullName: (data.full_name as string | null) ?? null,
      };
    }
  } catch {
    // profiles table may not exist yet — fall through to a minimal profile.
  }

  return {
    id: user.id,
    email: user.email ?? "",
    role: "member",
    fullName: null,
  };
}

export async function requireAdminProfile(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Not authorized: admin access required");
  }
  return profile;
}
