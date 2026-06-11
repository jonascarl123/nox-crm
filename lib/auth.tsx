"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export type SessionProfile = {
  id: string;
  email: string;
  role: "admin" | "member";
  fullName: string | null;
};

interface AuthValue {
  profile: SessionProfile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({
  profile,
  children,
}: {
  profile: SessionProfile | null;
  children: ReactNode;
}) {
  const router = useRouter();

  const signOut = async () => {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      // ignore — still send the user back to login
    }
    router.replace("/login");
    router.refresh();
  };

  const value: AuthValue = {
    profile,
    isAdmin: profile?.role === "admin",
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
