"use client";

import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

export default function TopBar() {
  const { user, logout, login, loggedIn } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-sm text-slate-400">
        <span className="font-medium text-slate-600">Residential Solar</span>{" "}
        Operations
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <Avatar name={user.name} color={user.avatarColor} size={36} />
            <StatusBadge tone="slate">{user.role}</StatusBadge>
          </div>
        )}
        {loggedIn ? (
          <button
            onClick={logout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={login}
            className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
          >
            Log back in
          </button>
        )}
      </div>
    </header>
  );
}
