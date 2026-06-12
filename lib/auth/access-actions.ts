"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendLoginCodeToEmail } from "@/lib/auth/send-login-code";
import { requireAdminProfile } from "@/lib/auth/profile";

export type AccessUser = {
  id: string;
  email: string;
  role: "admin" | "member";
  fullName: string | null;
  createdAt: string | null;
};

export type AccessResult = { ok: true } | { error: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function listAccessUsers(): Promise<AccessUser[]> {
  await requireAdminProfile();
  const admin = createServerSupabase();
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, role, full_name, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    email: r.email as string,
    role: (r.role as "admin" | "member") ?? "member",
    fullName: (r.full_name as string | null) ?? null,
    createdAt: (r.created_at as string | null) ?? null,
  }));
}

async function findUserIdByEmail(
  admin: ReturnType<typeof createServerSupabase>,
  email: string
): Promise<string | null> {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) return null;
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email
    );
    if (match) return match.id;
    if (data.users.length < 200) break;
  }
  return null;
}

export async function addAccessUser(input: {
  email: string;
  role: "admin" | "member";
  fullName?: string;
}): Promise<AccessResult> {
  await requireAdminProfile();

  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  const fullName = input.fullName?.trim() || null;
  const admin = createServerSupabase();

  const { data: created, error: createErr } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });

  let userId = created?.user?.id ?? null;
  if (createErr && !userId) {
    userId = await findUserIdByEmail(admin, email);
    if (!userId) return { error: createErr.message };
  }

  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      role: input.role,
      full_name: fullName,
    },
    { onConflict: "id" }
  );
  if (upsertErr) return { error: upsertErr.message };

  revalidatePath("/settings");
  return { ok: true };
}

export async function sendLoginCode(email: string): Promise<AccessResult> {
  await requireAdminProfile();
  return sendLoginCodeToEmail(email);
}

export async function removeAccessUser(id: string): Promise<AccessResult> {
  const me = await requireAdminProfile();
  if (me.id === id) {
    return { error: "You can't remove your own access." };
  }
  const admin = createServerSupabase();
  await admin.from("profiles").delete().eq("id", id);
  await admin.auth.admin.deleteUser(id).catch(() => {
    // user row already gone — ignore
  });
  revalidatePath("/settings");
  return { ok: true };
}
