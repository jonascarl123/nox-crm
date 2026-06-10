"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuth } from "@/lib/auth";

export default function AppShell({ children }: { children: ReactNode }) {
  const { loggedIn, login } = useAuth();

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-xl font-bold text-white">
            E
          </div>
          <h1 className="text-xl font-bold text-slate-900">Enerflo</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Sign in to your solar operations workspace
          </p>
          <button
            onClick={login}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Sign in as Admin (demo)
          </button>
        </div>
      </div>
    );
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
