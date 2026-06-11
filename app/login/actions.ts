"use server";

import { createServerAuthClient } from "@/lib/supabase/server-auth";

export type ActionResult = { ok: true } | { error: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Emails a one-time login code. `shouldCreateUser: false` means only emails an
 * admin has already added (Settings → Access) can request a code.
 */
export async function requestCode(email: string): Promise<ActionResult> {
  const normalized = normalizeEmail(email);
  if (!normalized) return { error: "Enter your email address." };

  try {
    const supabase = await createServerAuthClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: false },
    });
    if (error) {
      // Supabase returns a generic error when the user doesn't exist; keep the
      // message friendly without leaking whether the email is registered.
      return {
        error:
          "We couldn't send a code to that email. Make sure an admin has added you.",
      };
    }
    return { ok: true };
  } catch {
    return { error: "Sign-in is not configured yet. Contact your admin." };
  }
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createServerAuthClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

export async function verifyCode(
  email: string,
  token: string
): Promise<ActionResult> {
  const normalized = normalizeEmail(email);
  const code = token.trim();
  if (!code) return { error: "Enter the code from your email." };

  try {
    const supabase = await createServerAuthClient();
    const { error } = await supabase.auth.verifyOtp({
      email: normalized,
      token: code,
      type: "email",
    });
    if (error) return { error: "Invalid or expired code. Try again." };
    return { ok: true };
  } catch {
    return { error: "Sign-in is not configured yet. Contact your admin." };
  }
}
