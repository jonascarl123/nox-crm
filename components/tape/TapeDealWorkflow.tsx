"use client";

import { useState } from "react";
import Link from "next/link";
import type { TapeCustomer } from "@/lib/tape/types";
import { fullAddress } from "@/lib/tape/address";
import {
  TAPE_DEAL_STEP_ORDER,
  TAPE_DEAL_STEP_LABELS,
  activeDealStep,
  inferDealSteps,
  type TapeDealStep,
} from "@/lib/tape/deal-steps";
import StatusBadge from "@/components/ui/StatusBadge";
import { currency, formatDate } from "@/lib/format";

function StepPanel({
  step,
  customer,
}: {
  step: TapeDealStep;
  customer: TapeCustomer;
}) {
  const rows: [string, string | null | undefined][] = [];

  switch (step) {
    case "consumption":
      rows.push(
        ["Product", customer.productName],
        ["System size (kW)", customer.kw != null ? String(customer.kw) : null],
        ["Address", fullAddress(customer)]
      );
      break;
    case "design":
      rows.push(
        ["Product", customer.productName],
        ["kW", customer.kw != null ? String(customer.kw) : null],
        ["Net EPC", customer.netEpc != null ? currency(customer.netEpc) : null]
      );
      break;
    case "proposal":
      rows.push(
        ["SOW", customer.sowAmount != null ? currency(customer.sowAmount) : null],
        ["Gross account value", customer.grossAccountValue != null ? currency(customer.grossAccountValue) : null],
        ["Product", customer.productName]
      );
      break;
    case "financing":
      rows.push(
        ["NTP Status", customer.ntpAppStatus],
        ["Job Status", customer.jobStatus]
      );
      break;
    case "contracting":
      rows.push(
        ["Sale Date", customer.saleDate ? formatDate(customer.saleDate) : null],
        ["NTP Status", customer.ntpAppStatus],
        ["Closer", customer.closer1]
      );
      break;
    case "submission":
      rows.push(
        ["Job Status", customer.jobStatus],
        ["Install completed", customer.installCompletedDate ? formatDate(customer.installCompletedDate) : null],
        ["Office", customer.officeName]
      );
      break;
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">
        {TAPE_DEAL_STEP_LABELS[step]}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Data synced from Tape. Workflow actions will be available in a future release.
      </p>
      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-slate-600">{label}</dt>
            <dd className="text-right text-slate-900">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {customer.notes && step === "submission" && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <p className="mb-1 font-medium text-slate-500">Notes</p>
          <p className="whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function TapeDealWorkflow({
  customer,
}: {
  customer: TapeCustomer;
}) {
  const steps = inferDealSteps(customer.jobStatus, customer.ntpAppStatus);
  const [current, setCurrent] = useState<TapeDealStep>(activeDealStep(steps));
  const idx = TAPE_DEAL_STEP_ORDER.indexOf(current);
  const address = fullAddress(customer);

  const goBack = () => idx > 0 && setCurrent(TAPE_DEAL_STEP_ORDER[idx - 1]);
  const skip = () =>
    idx < TAPE_DEAL_STEP_ORDER.length - 1 &&
    setCurrent(TAPE_DEAL_STEP_ORDER[idx + 1]);

  return (
    <div className="-m-6">
      <div className="border-b border-slate-200 bg-white px-6 py-2.5 text-xs text-slate-400">
        <Link href="/deals" className="hover:text-slate-600">
          Home
        </Link>{" "}
        ›{" "}
        <Link href="/deals" className="hover:text-slate-600">
          Deals
        </Link>{" "}
        ›{" "}
        <span className="text-slate-600">
          {customer.customerName ?? "Deal"}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900">
            {customer.customerName ?? "Unknown"}
          </h1>
          <StatusBadge tone="green">Active</StatusBadge>
          {customer.jobStatus && <StatusBadge value={customer.jobStatus} />}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
          {address && <span>📍 {address}</span>}
          <span>👤 Closer: {customer.closer1 ?? "—"}</span>
          <span>👤 Setter: {customer.setter1 ?? "—"}</span>
          <span>
            ＃ Deal ID: {customer.pid ?? customer.tapeRecordId}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-5xl rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex gap-8 p-6">
            <nav className="w-56 shrink-0">
              <ul className="relative space-y-1">
                {TAPE_DEAL_STEP_ORDER.map((step, i) => {
                  const status = steps[step];
                  const isCurrent = step === current;
                  const complete = status === "complete";
                  const isLast = i === TAPE_DEAL_STEP_ORDER.length - 1;

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
                        type="button"
                        onClick={() => setCurrent(step)}
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
                          {TAPE_DEAL_STEP_LABELS[step]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="min-w-0 flex-1 border-l border-slate-100 pl-8">
              <StepPanel step={current} customer={customer} />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={goBack}
              disabled={idx === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              ‹ Back
            </button>
            <Link
              href={`/customers/${customer.tapeRecordId}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View lead profile
            </Link>
            <button
              type="button"
              onClick={skip}
              disabled={idx === TAPE_DEAL_STEP_ORDER.length - 1}
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
