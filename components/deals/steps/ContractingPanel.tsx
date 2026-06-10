"use client";

import { useState } from "react";
import type { Deal, ContractStatus } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import PanelShell from "./PanelShell";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

const CHECKLIST: { key: keyof Deal["checklist"]; label: string }[] = [
  { key: "utilityBill", label: "Utility bill uploaded" },
  { key: "designComplete", label: "Design complete" },
  { key: "proposalAccepted", label: "Proposal accepted" },
  { key: "financeSet", label: "Financing set" },
];

export default function ContractingPanel({ deal }: { deal: Deal }) {
  const { completeStep, updateDeal } = useStore();
  const [contractStatus, setContractStatus] = useState<ContractStatus>(
    deal.contract.status
  );

  const sendToDocusign = () => {
    setContractStatus("SENT");
    setTimeout(() => {
      setContractStatus("SIGNED");
      updateDeal(deal.id, {
        contract: { status: "SIGNED", signedAt: new Date().toISOString().slice(0, 10) },
      });
    }, 1200);
  };

  return (
    <PanelShell
      deal={deal}
      step="contracting"
      subtitle="Verify the deal is clean, then send the contract for e-signature."
      onComplete={() => completeStep(deal.id, "contracting")}
      headerExtra={<StatusBadge value={contractStatus} />}
    >
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">
          Pre-Submit Checklist
        </p>
        <ul className="space-y-2">
          {CHECKLIST.map((item) => {
            const ok = deal.checklist[item.key];
            return (
              <li
                key={item.key}
                className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    ok ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"
                  }`}
                >
                  {ok ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm ${ok ? "text-slate-700" : "text-slate-400"}`}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Contract e-Signature
            </p>
            <p className="text-sm text-slate-500">
              {contractStatus === "SIGNED"
                ? "Signed by customer."
                : contractStatus === "SENT"
                  ? "Sent — awaiting signature…"
                  : "Not yet sent to the customer."}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={sendToDocusign}
            disabled={contractStatus !== "NOT_SENT"}
          >
            {contractStatus === "NOT_SENT" ? "Send to DocuSign" : "Sent"}
          </Button>
        </div>
      </div>
    </PanelShell>
  );
}
