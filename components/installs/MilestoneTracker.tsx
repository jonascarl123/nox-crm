"use client";

import type { Install, Milestone, MilestoneStatus } from "@/lib/mock-data";
import { userById } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/format";

const STATUSES: MilestoneStatus[] = ["PENDING", "IN_PROGRESS", "DONE"];

function StepDot({ status }: { status: MilestoneStatus }) {
  if (status === "DONE")
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  if (status === "IN_PROGRESS")
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-50">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
      </span>
    );
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
    </span>
  );
}

export default function MilestoneTracker({ install }: { install: Install }) {
  const { setMilestoneStatus, setMilestoneNotes } = useStore();
  const milestones = [...install.milestones].sort((a, b) => a.order - b.order);

  return (
    <div>
      {/* Horizontal progress pipeline */}
      <div className="mb-8 flex items-center">
        {milestones.map((m, i) => (
          <div key={m.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <StepDot status={m.status} />
              <span className="mt-2 max-w-20 text-center text-xs font-medium text-slate-600">
                {m.name}
              </span>
            </div>
            {i < milestones.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  m.status === "DONE" ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Milestone detail cards */}
      <div className="space-y-3">
        {milestones.map((m: Milestone) => {
          const owner = userById(m.ownerId);
          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StepDot status={m.status} />
                  <div>
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      {owner && (
                        <span className="flex items-center gap-1">
                          <Avatar
                            name={owner.name}
                            color={owner.avatarColor}
                            size={16}
                          />
                          {owner.name}
                        </span>
                      )}
                      <span>· Due {formatDate(m.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge value={m.status} />
                  <select
                    value={m.status}
                    onChange={(e) =>
                      setMilestoneStatus(
                        install.id,
                        m.id,
                        e.target.value as MilestoneStatus
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-orange-500 focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                defaultValue={m.notes}
                onBlur={(e) =>
                  setMilestoneNotes(install.id, m.id, e.target.value)
                }
                placeholder="Add a note…"
                className="mt-3 w-full rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
