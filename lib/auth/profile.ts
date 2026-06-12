import { cache } from "react";
import { unstable_cache } from "next/cache";
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

export const getSessionUser = cache(async () => {
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
});

async function fetchProfile(userId: string, email: string): Promise<SessionProfile> {
  try {
    const admin = createServerSupabase();
    const { data } = await admin
      .from("profiles")
      .select("id, email, role, full_name")
      .eq("id", userId)
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
    // profiles table may not exist yet
  }

  return {
    id: userId,
    email,
    role: "member",
    fullName: null,
  };
}

const getCachedProfile = (userId: string, email: string) =>
  unstable_cache(
    async () => fetchProfile(userId, email),
    ["session-profile", userId],
    { revalidate: 120 }
  )();

export const getCurrentProfile = cache(async (): Promise<SessionProfile | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  return getCachedProfile(user.id, user.email ?? "");
});

export async function requireAdminProfile(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Not authorized: admin access required");
  }
  return profile;
}
