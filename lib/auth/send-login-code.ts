import { createServerSupabase } from "@/lib/supabase/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { sendLoginCodeEmail } from "@/lib/auth/login-code-email";
import { isGraphMailConfigured } from "@/lib/microsoft/graph-auth";

export type SendLoginCodeResult = { ok: true } | { error: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findAuthUserId(email: string) {
  const admin = createServerSupabase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) break;
  }
  return null;
}

/** Invite-only: user must exist in profiles (or auth.users as fallback). */
async function isAllowedEmail(
  email: string
): Promise<{ allowed: boolean; reason?: string }> {
  const admin = createServerSupabase();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (data) return { allowed: true };

  if (error) {
    // profiles table missing or misconfigured — fall back to auth.users
    const authUserId = await findAuthUserId(email);
    if (authUserId) return { allowed: true };
    return {
      allowed: false,
      reason:
        "Could not verify access. Ask an admin to run the profiles migration.",
    };
  }

  // No profile row — check auth in case seed created auth user only
  const authUserId = await findAuthUserId(email);
  if (authUserId) return { allowed: true };

  return { allowed: false };
}

export async function sendLoginCodeToEmail(
  email: string
): Promise<SendLoginCodeResult> {
  const normalized = normalizeEmail(email);
  if (!normalized) return { error: "Enter your email address." };

  let access: { allowed: boolean; reason?: string };
  try {
    access = await isAllowedEmail(normalized);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Server configuration error.";
    return {
      error: `Sign-in is not configured on the server: ${message}`,
    };
  }

  if (!access.allowed) {
    return {
      error:
        access.reason ??
        "We couldn't send a code to that email. Make sure an admin has added you.",
    };
  }

  if (isGraphMailConfigured()) {
    try {
      const admin = createServerSupabase();
      const { data, error } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: normalized,
      });

      const code = data?.properties?.email_otp;
      if (error || !code) {
        return {
          error: error?.message ?? "Could not generate a login code. Try again.",
        };
      }

      await sendLoginCodeEmail({ to: normalized, code });
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send login email.";
      return { error: message };
    }
  }

  // Fallback when Graph is not configured — Supabase sends the email.
  try {
    const supabase = await createServerAuthClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: false },
    });
    if (error) {
      if (error.message.includes("only request this after")) {
        return {
          error: "Please wait a minute before requesting another code.",
        };
      }
      return { error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sign-in is not configured.";
    return {
      error: `Email is not configured yet: ${message}`,
    };
  }
}
