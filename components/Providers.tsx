"use client";

import type { ReactNode } from "react";
import { AuthProvider, type SessionProfile } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/shell/AppShell";

export default function Providers({
  profile,
  children,
}: {
  profile: SessionProfile | null;
  children: ReactNode;
}) {
  return (
    <AuthProvider profile={profile}>
      <StoreProvider>
        <AppShell>{children}</AppShell>
      </StoreProvider>
    </AuthProvider>
  );
}
