"use client";

import Link from "next/link";
import type { Deal } from "@/lib/mock-data";
import { customerName, userById } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import PanelShell from "./PanelShell";
import Button from "@/components/ui/Button";
import { currency } from "@/lib/format";

export default function SubmissionPanel({ deal }: { deal: Deal }) {
  const { submitDeal, installs } = useStore();
  const submitted = deal.stage === "SUBMITTED" || deal.stage === "INSTALL";
  const install = installs.find((i) => i.dealId === deal.id);

  const rows: [string, string][] = [
    ["Customer", customerName(deal.customerId)],
    ["Rep", userById(deal.repId)?.name ?? "—"],
    ["Address", `${deal.projectAddress}, ${deal.city}, ${deal.state} ${deal.zip}`],
    ["System Size", deal.design ? `${deal.design.systemSizeKw} kW` : "—"],
    ["Total Price", deal.proposal ? currency(deal.proposal.priceTotal) : "—"],
    ["Financing", deal.finance ? `${deal.finance.financeType} · ${deal.finance.lenderName}` : "—"],
    ["Contract", deal.contract.status.replace("_", " ")],
  ];

  return (
    <PanelShell
      deal={deal}
      step="submission"
      subtitle="Review the deal summary and submit the project to operations."
    >
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-slate-100 last:border-0">
                <td className="w-40 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">
                  {k}
                </td>
                <td className="px-4 py-2.5 text-slate-900">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submitted ? (
        <div className="rounded-xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-emerald-900">
                Project submitted to operations
              </p>
              <p className="text-sm text-emerald-700">
                An install record has been created and milestones are being
                tracked.
              </p>
            </div>
          </div>
          {install && (
            <Link href={`/installs/${install.id}`}>
              <Button className="mt-4">View Install →</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button onClick={() => submitDeal(deal.id)}>Submit Project</Button>
        </div>
      )}
    </PanelShell>
  );
}
