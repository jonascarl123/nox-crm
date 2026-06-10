"use client";

import { useState } from "react";
import type { Deal } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import PanelShell from "./PanelShell";
import { Field, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { currency } from "@/lib/format";

export default function ProposalPanel({ deal }: { deal: Deal }) {
  const { completeStep } = useStore();
  const p = deal.proposal;
  const [preview, setPreview] = useState(false);

  const base =
    (p?.priceTotal ?? 0) -
    (p?.adders.reduce((s, a) => s + a.amount, 0) ?? 0);

  return (
    <PanelShell
      deal={deal}
      step="proposal"
      subtitle="Pricing, adders and savings pulled from the design and consumption data."
      onComplete={() => completeStep(deal.id, "proposal")}
      headerExtra={
        p ? <StatusBadge value={p.status} /> : undefined
      }
    >
      {!p ? (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
          Complete the Design step to generate a proposal.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs text-slate-500">System Size</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {deal.design?.systemSizeKw ?? "—"} kW
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs text-slate-500">Annual Usage</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {deal.consumption?.annualKwh.toLocaleString() ?? "—"} kWh
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <p className="text-xs text-emerald-600">Est. Lifetime Savings</p>
              <p className="mt-1 text-xl font-bold text-emerald-900">
                {currency(p.savingsEstimate)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-600">Base System</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                    {currency(base)}
                  </td>
                </tr>
                {p.adders.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="px-4 py-2.5 text-slate-600">
                      Adder · {a.name}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                      {currency(a.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Total Price
                  </td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-slate-900">
                    {currency(p.priceTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Finance Type">
              <Select defaultValue={p.financeType}>
                <option value="CASH">Cash</option>
                <option value="LOAN">Loan</option>
                <option value="LEASE">Lease</option>
                <option value="PPA">PPA</option>
              </Select>
            </Field>
            <Field label="Proposal Status">
              <Select defaultValue={p.status}>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
              </Select>
            </Field>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setPreview(true)}>
              Generate PDF
            </Button>
          </div>
        </>
      )}

      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title="Proposal Preview"
        wide
        footer={
          <Button onClick={() => setPreview(false)}>Close</Button>
        }
      >
        <div className="rounded-xl bg-slate-50 p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 font-bold text-white">
                N
              </div>
              <span className="font-bold text-slate-900">Nox Power</span>
            </div>
            <span className="text-xs text-slate-400">Solar Proposal</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {deal.design?.title ?? "Solar System Proposal"}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">System Size</p>
              <p className="font-semibold text-slate-900">
                {deal.design?.systemSizeKw} kW
              </p>
            </div>
            <div>
              <p className="text-slate-400">Offset</p>
              <p className="font-semibold text-slate-900">
                {deal.design?.offsetPct}%
              </p>
            </div>
            <div>
              <p className="text-slate-400">Total Price</p>
              <p className="font-semibold text-slate-900">
                {p && currency(p.priceTotal)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Est. Lifetime Savings</p>
              <p className="font-semibold text-emerald-700">
                {p && currency(p.savingsEstimate)}
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            This is a mock preview. In production this renders a branded,
            downloadable PDF.
          </p>
        </div>
      </Modal>
    </PanelShell>
  );
}
