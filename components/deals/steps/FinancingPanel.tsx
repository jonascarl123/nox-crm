"use client";

import type { Deal } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import PanelShell from "./PanelShell";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

export default function FinancingPanel({ deal }: { deal: Deal }) {
  const { completeStep } = useStore();
  const f = deal.finance;

  return (
    <PanelShell
      deal={deal}
      step="financing"
      subtitle="Record the financing details. (Manual entry — no lender API in this prototype.)"
      onComplete={() => completeStep(deal.id, "financing")}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Finance Type">
          <Select defaultValue={f?.financeType ?? "LOAN"}>
            <option value="CASH">Cash</option>
            <option value="LOAN">Loan</option>
            <option value="LEASE">Lease</option>
            <option value="PPA">PPA</option>
          </Select>
        </Field>
        <Field label="Lender">
          <Input
            defaultValue={f?.lenderName ?? ""}
            placeholder="e.g. GoodLeap, Mosaic, Sunlight"
          />
        </Field>
        <Field label="Amount ($)">
          <Input defaultValue={f?.amount ?? ""} placeholder="28560" />
        </Field>
        <Field label="Status">
          <Select defaultValue={f?.status ?? "Pending"}>
            <option>Pending</option>
            <option>Submitted</option>
            <option>Approved</option>
            <option>Declined</option>
          </Select>
        </Field>
      </div>
      <Field label="Notes">
        <Textarea
          rows={3}
          defaultValue={f?.notes ?? ""}
          placeholder="Stips, APR, term length, etc."
        />
      </Field>
    </PanelShell>
  );
}
