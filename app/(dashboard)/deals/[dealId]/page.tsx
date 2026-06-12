"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  customerName,
  userById,
  STEP_ORDER,
  type StepKey,
} from "@/lib/mock-data";
import StatusBadge from "@/components/ui/StatusBadge";
import StepperNav from "@/components/deals/StepperNav";
import ConsumptionPanel from "@/components/deals/steps/ConsumptionPanel";
import DesignPanel from "@/components/deals/steps/DesignPanel";
import ProposalPanel from "@/components/deals/steps/ProposalPanel";
import FinancingPanel from "@/components/deals/steps/FinancingPanel";
import ContractingPanel from "@/components/deals/steps/ContractingPanel";
import SubmissionPanel from "@/components/deals/steps/SubmissionPanel";
import PlaceholderPanel from "@/components/deals/steps/PlaceholderPanel";

function activeStepFor(steps: Record<StepKey, string>): StepKey {
  return STEP_ORDER.find((s) => steps[s] === "active") ?? STEP_ORDER[0];
}

export default function DealWorkflowPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = use(params);
  const { deals } = useStore();
  const deal = deals.find((d) => d.id === dealId);

  const [current, setCurrent] = useState<StepKey>(
    deal ? activeStepFor(deal.steps) : "prequalification"
  );

  if (!deal) {
    return (
      <div className="text-slate-500">
        Deal not found.{" "}
        <Link href="/deals" className="text-orange-600 hover:underline">
          Back to pipeline
        </Link>
      </div>
    );
  }

  const rep = userById(deal.repId);
  const idx = STEP_ORDER.indexOf(current);
  const goBack = () => idx > 0 && setCurrent(STEP_ORDER[idx - 1]);
  const skip = () =>
    idx < STEP_ORDER.length - 1 && setCurrent(STEP_ORDER[idx + 1]);

  return (
    <div className="-m-6">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white px-6 py-2.5 text-xs text-slate-400">
        <Link href="/deals" className="hover:text-slate-600">
          Home
        </Link>{" "}
        ›{" "}
        <Link href="/deals" className="hover:text-slate-600">
          Deals
        </Link>{" "}
        › <span className="text-slate-600">{customerName(deal.customerId)}</span>
      </div>

      {/* Header band */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900">
            {customerName(deal.customerId)}
          </h1>
          <StatusBadge tone="green">Active</StatusBadge>
          <button className="text-slate-300 hover:text-slate-500">···</button>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
          <span>
            📍 {deal.projectAddress}, {deal.city}, {deal.state} {deal.zip}
          </span>
          <span>🏗 Installer: {deal.installerName}</span>
          <span>👤 Sales Rep: {rep?.name}</span>
          <span>＃ Deal ID: {deal.code}</span>
        </div>
      </div>

      {/* Workflow card */}
      <div className="p-6">
        <div className="mx-auto max-w-5xl rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex gap-8 p-6">
            <StepperNav deal={deal} current={current} onSelect={setCurrent} />
            <div className="min-w-0 flex-1 border-l border-slate-100 pl-8">
              {current === "prequalification" && (
                <PlaceholderPanel
                  deal={deal}
                  step="prequalification"
                  subtitle="Verify the lead qualifies before investing design and proposal effort."
                  emptyText=""
                  actionLabel="Run Prequalification"
                  checklist={[
                    "Homeowner verified",
                    "Property ownership confirmed",
                    "Soft credit pre-check",
                    "Roof age & condition acceptable",
                  ]}
                />
              )}
              {current === "requiredForContracting" && (
                <PlaceholderPanel
                  deal={deal}
                  step="requiredForContracting"
                  subtitle="Collect the documents and approvals needed before contracting."
                  emptyText=""
                  actionLabel="Add Requirement"
                  checklist={[
                    "Utility bill uploaded",
                    "Government ID verified",
                    "HOA / permit pre-check",
                  ]}
                />
              )}
              {current === "consumption" && <ConsumptionPanel deal={deal} />}
              {current === "design" && <DesignPanel deal={deal} />}
              {current === "proposal" && <ProposalPanel deal={deal} />}
              {current === "financing" && <FinancingPanel deal={deal} />}
              {current === "contracting" && <ContractingPanel deal={deal} />}
              {current === "siteSurvey" && (
                <PlaceholderPanel
                  deal={deal}
                  step="siteSurvey"
                  subtitle="Schedule and capture the sales-team site survey."
                  emptyText="No site survey scheduled."
                  actionLabel="Schedule Site Survey"
                />
              )}
              {current === "submission" && <SubmissionPanel deal={deal} />}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <button
              onClick={goBack}
              disabled={idx === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              ‹ Back
            </button>
            <button
              onClick={skip}
              disabled={idx === STEP_ORDER.length - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Skip for now ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
