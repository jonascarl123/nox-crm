"use client";

import type { ReactNode } from "react";
import { AuthProvider, type SessionProfile } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";

export default function Providers({
  profile,
  children,
}: {
  profile: SessionProfile | null;
  children: ReactNode;
}) {
  return (
    <AuthProvider profile={profile}>
      <StoreProvider>{children}</StoreProvider>
    </AuthProvider>
  );
}
