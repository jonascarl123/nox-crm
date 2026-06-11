"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // The login page renders full-screen without the app chrome. Middleware
  // guarantees every other route is reached only by an authenticated user.
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="scrollbar-thin flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
