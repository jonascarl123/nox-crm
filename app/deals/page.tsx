"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  DEAL_STAGES,
  customerName,
  customerById,
  userById,
  officeById,
  dealProgress,
} from "@/lib/mock-data";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import MiniProgress from "@/components/ui/MiniProgress";
import DealCard from "@/components/deals/DealCard";

const STAGE_LABELS: Record<string, string> = {
  SETUP: "Setup",
  CONSUMPTION: "Consumption",
  DESIGN: "Design",
  PROPOSAL: "Proposal",
  FINANCING: "Financing",
  CONTRACTING: "Contracting",
  SUBMITTED: "Submitted",
  INSTALL: "Install",
};

const COLUMNS = [
  "Deal ID",
  "View",
  "Customer",
  "Office",
  "Agent",
  "Setter",
  "Installer",
  "Lead Source",
  "Address",
  "Phone",
  "Utility bill",
  "Deal Stage",
  "Progress",
];

export default function DealsPage() {
  const { deals, users } = useStore();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [repFilter, setRepFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return deals.filter((d) => {
      const cust = customerById(d.customerId);
      const hay =
        `${customerName(d.customerId)} ${d.code} ${d.projectAddress} ${d.city} ${cust?.phone ?? ""} ${d.installerName}`.toLowerCase();
      return (
        hay.includes(q) &&
        (repFilter === "all" || d.repId === repFilter) &&
        (stageFilter === "all" || d.stage === stageFilter)
      );
    });
  }, [deals, search, repFilter, stageFilter]);

  const page = filtered.slice(0, pageSize);

  return (
    <div>
      {/* Header */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Company Deals
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="!py-1.5 text-xs">
            V2 Deals
          </Button>
          <Link href="/customers/new">
            <Button className="!py-1.5 text-xs">+ New Lead</Button>
          </Link>
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Deals done by all sales reps in your company
      </p>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
        <select
          value={repFilter}
          onChange={(e) => setRepFilter(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm shadow-sm focus:outline-none"
        >
          <option value="all">All agents</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm shadow-sm focus:outline-none"
        >
          <option value="all">All stages</option>
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" className="!py-1.5 text-xs">
            Export to Excel
          </Button>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(["table", "kanban"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                  view === v
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = filtered.filter((d) => d.stage === stage);
            return (
              <div key={stage} className="flex w-72 shrink-0 flex-col">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <StatusBadge value={stage} />
                  <span className="text-sm font-medium text-slate-400">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="scrollbar-thin flex-1 space-y-3 rounded-xl bg-slate-100/70 p-3">
                  {stageDeals.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">
                      No deals
                    </p>
                  ) : (
                    stageDeals.map((d) => <DealCard key={d.id} deal={d} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {COLUMNS.map((col) => (
                    <th key={col} className="whitespace-nowrap px-4 py-3">
                      <span className="flex items-center gap-1">
                        {col}
                        <span className="text-slate-300">⋮</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.map((d) => {
                  const cust = customerById(d.customerId);
                  const rep = userById(d.repId);
                  const setter = userById(d.setterId);
                  const office = officeById(rep?.officeId);
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-700">
                        {d.code}
                      </td>
                      <td className="px-4 py-2.5">
                        <Link href={`/deals/${d.id}`}>
                          <span className="inline-flex rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700">
                            View
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-blue-600">
                        <Link href={`/deals/${d.id}`} className="hover:underline">
                          {customerName(d.customerId)}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {office?.name ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-blue-600">
                        {rep?.name ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {setter?.name ?? ""}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {d.installerName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {cust?.leadSource ?? ""}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {d.projectAddress}, {d.city}, {d.state} {d.zip}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {cust?.phone ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {d.checklist.utilityBill ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge value={d.stage} />
                      </td>
                      <td className="px-4 py-2.5">
                        <MiniProgress value={dealProgress(d)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <button className="rounded border border-slate-200 px-2 py-1 text-slate-400">
                «
              </button>
              <button className="rounded border border-blue-500 bg-blue-500 px-2.5 py-1 text-white">
                1
              </button>
              <button className="rounded border border-slate-200 px-2 py-1 text-slate-400">
                »
              </button>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-2 rounded border border-slate-200 px-2 py-1"
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              1 - {page.length} of {filtered.length} items
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
