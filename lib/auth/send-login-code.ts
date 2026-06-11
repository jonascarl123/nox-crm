import { createServerSupabase } from "@/lib/supabase/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { sendLoginCodeEmail } from "@/lib/auth/login-code-email";
import { isGraphMailConfigured } from "@/lib/microsoft/graph-auth";

export type SendLoginCodeResult = { ok: true } | { error: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Invite-only: user must exist in profiles before a code is sent. */
async function isAllowedEmail(email: string) {
  const admin = createServerSupabase();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return Boolean(data);
}

export async function sendLoginCodeToEmail(
  email: string
): Promise<SendLoginCodeResult> {
  const normalized = normalizeEmail(email);
  if (!normalized) return { error: "Enter your email address." };

  if (!(await isAllowedEmail(normalized))) {
    return {
      error:
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
        return { error: "Could not generate a login code. Try again." };
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
      return {
        error:
          "We couldn't send a code to that email. Make sure an admin has added you.",
      };
    }
    return { ok: true };
  } catch {
    return {
      error:
        "Email is not configured yet. Set Azure Graph env vars or Supabase email.",
    };
  }
}
