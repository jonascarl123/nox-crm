"use client";

import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

export default function TopBar() {
  const { profile, signOut } = useAuth();
  const displayName = profile?.fullName || profile?.email || "Account";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-sm text-slate-400">
        <span className="font-medium text-slate-600">Residential Solar</span>{" "}
        Operations
      </div>

      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="text-xs text-slate-400">{profile.email}</p>
            </div>
            <Avatar name={displayName} color="#ea580c" size={36} />
            <StatusBadge tone="slate">
              {profile.role === "admin" ? "ADMIN" : "MEMBER"}
            </StatusBadge>
          </div>
        )}
        <button
          onClick={signOut}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
