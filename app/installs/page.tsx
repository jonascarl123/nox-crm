"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  COMPANY_NAME,
  userById,
  officeById,
  installProgress,
  currentMilestone,
  lastCompletedMilestone,
  projectManager,
} from "@/lib/mock-data";
import StatusBadge from "@/components/ui/StatusBadge";
import MiniProgress from "@/components/ui/MiniProgress";
import { formatDate } from "@/lib/format";

const COLUMNS = [
  "Actions",
  "Customer",
  "Address",
  "Status",
  "Progress",
  "Current Milestone",
  "Last Completed Milestone",
  "Sold By",
  "Sales Office",
  "Sales Rep",
  "Sales Rep Phone",
  "Sales Rep Email",
  "Installer",
  "Project Manager",
  "Date",
];

export default function InstallsPage() {
  const { installs, deals } = useStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return installs.filter((i) =>
      `${i.customerName} ${i.address} ${i.status}`.toLowerCase().includes(q)
    );
  }, [installs, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Install Project Tracker
        </h1>
        <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
          Columns ▾
        </button>
      </div>

      <div className="mb-3 max-w-xs">
        <input
          placeholder="Search customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[1500px] text-sm">
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
              {filtered.map((inst) => {
                const deal = deals.find((d) => d.id === inst.dealId);
                const rep = userById(deal?.repId);
                const office = officeById(rep?.officeId);
                const pm = projectManager(inst);
                return (
                  <tr
                    key={inst.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2.5">
                      <Link href={`/installs/${inst.id}`}>
                        <span className="inline-flex rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700">
                          View
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">
                      {inst.customerName}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{inst.address}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge tone="blue">{inst.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-2.5">
                      <MiniProgress value={installProgress(inst)} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                      {currentMilestone(inst)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {lastCompletedMilestone(inst)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {COMPANY_NAME}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {office?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-blue-600">
                      {rep?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {rep?.phone ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-blue-600">
                      {rep?.email ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {deal?.installerName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {pm?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {formatDate(inst.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{filtered.length} active installs</span>
        </div>
      </div>
    </div>
  );
}
