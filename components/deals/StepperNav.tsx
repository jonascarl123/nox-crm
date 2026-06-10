"use client";

import type { Deal, StepKey } from "@/lib/mock-data";
import { STEP_ORDER, STEP_LABELS } from "@/lib/mock-data";

export default function StepperNav({
  deal,
  current,
  onSelect,
}: {
  deal: Deal;
  current: StepKey;
  onSelect: (step: StepKey) => void;
}) {
  return (
    <nav className="w-56 shrink-0">
      <ul className="relative space-y-1">
        {STEP_ORDER.map((step, i) => {
          const status = deal.steps[step];
          const isCurrent = step === current;
          const complete = status === "complete";
          const isLast = i === STEP_ORDER.length - 1;

          return (
            <li key={step} className="relative">
              {!isLast && (
                <span
                  className={`absolute left-[15px] top-8 h-[calc(100%-12px)] w-0.5 ${
                    complete ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
              <button
                onClick={() => onSelect(step)}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition ${
                  isCurrent ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <span
                  className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition ${
                    complete
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                        ? "border-orange-500 bg-white text-orange-600"
                        : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {complete ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? "text-slate-900"
                      : complete
                        ? "text-slate-700"
                        : "text-slate-500"
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
