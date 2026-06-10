"use client";

import type { Deal, StepKey } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import PanelShell from "./PanelShell";

export default function PlaceholderPanel({
  deal,
  step,
  subtitle,
  emptyText,
  actionLabel,
  checklist,
}: {
  deal: Deal;
  step: StepKey;
  subtitle: string;
  emptyText: string;
  actionLabel: string;
  checklist?: string[];
}) {
  const { completeStep } = useStore();

  return (
    <PanelShell
      deal={deal}
      step={step}
      subtitle={subtitle}
      onComplete={() => completeStep(deal.id, step)}
    >
      {checklist && checklist.length > 0 ? (
        <ul className="space-y-2">
          {checklist.map((item) => {
            const done = deal.steps[step] === "complete";
            return (
              <li
                key={item}
                className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    done ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"
                  }`}
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mb-3 text-slate-300">
            <path d="M4 7h16v13H4zM4 7l2-3h12l2 3" />
            <path d="M9 12h6" />
          </svg>
          <p className="mb-4 text-sm text-slate-400">{emptyText}</p>
          <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
            + {actionLabel}
          </button>
        </div>
      )}
    </PanelShell>
  );
}
