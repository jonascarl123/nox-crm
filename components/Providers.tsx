"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/shell/AppShell";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppShell>{children}</AppShell>
      </StoreProvider>
    </AuthProvider>
  );
}
