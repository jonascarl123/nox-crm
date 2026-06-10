"use client";

import type { Deal, MountingType } from "@/lib/mock-data";
import { INVERTER_OPTIONS, MODULE_OPTIONS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import PanelShell from "./PanelShell";
import { Field, Input, Select } from "@/components/ui/Field";

const MOUNTING: { key: MountingType; label: string; icon: string }[] = [
  { key: "ROOF", label: "Roof", icon: "M3 11l9-7 9 7M5 10v10h14V10" },
  { key: "GROUND", label: "Ground", icon: "M3 17h18M5 17V9h14v8M9 9V5h6v4" },
  { key: "PERGOLA", label: "Pergola", icon: "M4 7h16M4 7v13M20 7v13M4 11h16M4 15h16" },
];

export default function DesignPanel({ deal }: { deal: Deal }) {
  const { completeStep } = useStore();
  const d = deal.design;
  const arrays = d?.arrays ?? [];
  const totalSize =
    d?.systemSizeKw ??
    Math.round(
      (arrays.reduce((s, a) => s + a.count, 0) * 0.41) * 100
    ) / 100;

  return (
    <PanelShell
      deal={deal}
      step="design"
      subtitle="Enter system specs or attach a design from Aurora / OpenSolar."
      onComplete={() => completeStep(deal.id, "design")}
    >
      <Field label="Design Title">
        <Input
          defaultValue={d?.title ?? ""}
          placeholder="e.g. Smith Residence - Design 1"
        />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Mounting Type</p>
        <div className="grid grid-cols-3 gap-3">
          {MOUNTING.map((m) => {
            const selected = (d?.mountingType ?? "ROOF") === m.key;
            return (
              <div
                key={m.key}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                  selected
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className={selected ? "text-orange-600" : "text-slate-400"}
                >
                  <path d={m.icon} />
                </svg>
                <span
                  className={`text-sm font-medium ${selected ? "text-orange-700" : "text-slate-600"}`}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <p className="text-xs text-blue-600">Total System Size</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {totalSize ? `${totalSize} kW` : "—"}
          </p>
        </div>
        <div className="col-span-1 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <p className="text-xs text-emerald-600">Offset</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">
            {d?.offsetPct ?? 0}%
          </p>
        </div>
        <Field label="Inverter">
          <Select defaultValue={d?.inverter ?? INVERTER_OPTIONS[0]}>
            {INVERTER_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Arrays</p>
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2">Module</th>
                <th className="px-4 py-2">Count</th>
                <th className="px-4 py-2">Orientation</th>
                <th className="px-4 py-2">Azimuth</th>
                <th className="px-4 py-2">Production (kWh)</th>
              </tr>
            </thead>
            <tbody>
              {arrays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No arrays yet — add one or attach a design.
                  </td>
                </tr>
              ) : (
                arrays.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{a.module}</td>
                    <td className="px-4 py-2 text-slate-700">{a.count}</td>
                    <td className="px-4 py-2 text-slate-700">{a.orientation}</td>
                    <td className="px-4 py-2 text-slate-700">{a.azimuth}°</td>
                    <td className="px-4 py-2 text-slate-700">
                      {a.production.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700">
          + Add Array ({MODULE_OPTIONS.length} modules available)
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Layout Image</p>
          <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
            Drag & drop or click to upload
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Attachments</p>
          <div className="space-y-2">
            {(d?.attachments ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No attachments.</p>
            ) : (
              d!.attachments.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-slate-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  {f}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
