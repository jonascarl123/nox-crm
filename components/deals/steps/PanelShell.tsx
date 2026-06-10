"use client";

import type { ReactNode } from "react";
import type { Deal, StepKey } from "@/lib/mock-data";
import { STEP_LABELS } from "@/lib/mock-data";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

export default function PanelShell({
  deal,
  step,
  subtitle,
  children,
  onComplete,
  completeLabel = "Mark Step Complete",
  headerExtra,
}: {
  deal: Deal;
  step: StepKey;
  subtitle?: string;
  children: ReactNode;
  onComplete?: () => void;
  completeLabel?: string;
  headerExtra?: ReactNode;
}) {
  const status = deal.steps[step];
  return (
    <div className="flex-1">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {STEP_LABELS[step]}
            </h2>
            <StatusBadge value={status} />
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {headerExtra}
      </div>

      <div className="space-y-6">{children}</div>

      {onComplete && (
        <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
          <Button onClick={onComplete} disabled={status === "complete"}>
            {status === "complete" ? "Completed ✓" : completeLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
