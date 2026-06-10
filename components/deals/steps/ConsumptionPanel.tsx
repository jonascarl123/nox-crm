"use client";

import type { Deal } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import PanelShell from "./PanelShell";
import { Field, Input } from "@/components/ui/Field";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function ConsumptionPanel({ deal }: { deal: Deal }) {
  const { completeStep } = useStore();
  const c = deal.consumption;
  const monthly = c?.monthly ?? new Array(12).fill(0);
  const max = Math.max(...monthly, 1);

  return (
    <PanelShell
      deal={deal}
      step="consumption"
      subtitle="Capture the homeowner's current energy usage. This feeds design sizing and savings."
      onComplete={() => completeStep(deal.id, "consumption")}
    >
      <div className="grid grid-cols-3 gap-4">
        <Field label="Utility">
          <Input defaultValue={c?.utility ?? ""} placeholder="e.g. SCE" />
        </Field>
        <Field label="Annual Usage (kWh)">
          <Input defaultValue={c?.annualKwh ?? ""} placeholder="11250" />
        </Field>
        <Field label="Average Monthly Bill ($)">
          <Input defaultValue={c?.avgBill ?? ""} placeholder="214" />
        </Field>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">
          Monthly Usage Breakdown (kWh)
        </p>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
            {monthly.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{v || ""}</span>
                <div
                  className="w-full rounded-t bg-orange-400/80"
                  style={{ height: `${(v / max) * 120}px` }}
                />
                <span className="text-[10px] font-medium text-slate-500">
                  {MONTHS[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
