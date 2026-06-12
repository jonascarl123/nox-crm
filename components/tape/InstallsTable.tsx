"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TapeCustomer } from "@/lib/tape/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/format";

const COLUMNS = [
  "PID",
  "Customer",
  "Division",
  "Region",
  "Team",
  "Office",
  "Address",
  "Job Status",
  "NTP Status",
  "Stage",
  "Closer",
  "Setter",
  "KW",
  "Install Completed",
  "Sale Date",
  "Cancel Date",
];

function fullAddress(c: TapeCustomer): string {
  const parts = [
    c.customerAddress,
    c.customerCity,
    c.customerState,
    c.customerZip,
  ].filter(Boolean);
  return parts.join(", ");
}

function installStatus(c: TapeCustomer): string {
  if (c.pipelineStage === "cancelled") return c.jobStatus ?? "Cancelled";
  return c.jobStatus ?? c.ntpAppStatus ?? "In progress";
}

export default function InstallsTable({
  installs,
}: {
  installs: TapeCustomer[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return installs.filter((i) =>
      `${i.customerName} ${fullAddress(i)} ${installStatus(i)} ${i.pid ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [installs, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Install Project Tracker
        </h1>
        <span className="text-sm text-slate-500">
          {installs.length} closed deals (installed + cancelled)
        </span>
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
          <table className="w-full min-w-[1300px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {COLUMNS.map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst) => (
                <tr
                  key={inst.tapeRecordId}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                    {inst.pid ?? inst.tapeRecordId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-blue-600">
                    <Link
                      href={`/customers/${inst.tapeRecordId}`}
                      className="hover:underline"
                    >
                      {inst.customerName ?? "—"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.division ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.region ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.team ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.officeName ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {fullAddress(inst)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      tone={
                        inst.pipelineStage === "cancelled" ? "red" : "blue"
                      }
                    >
                      {installStatus(inst)}
                    </StatusBadge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.ntpAppStatus ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <StatusBadge
                      tone={
                        inst.pipelineStage === "cancelled" ? "red" : "green"
                      }
                      value={inst.pipelineStage}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.closer1 ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.setter1 ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.kw ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.installCompletedDate
                      ? formatDate(inst.installCompletedDate)
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.saleDate ? formatDate(inst.saleDate) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {inst.cancelDate ? formatDate(inst.cancelDate) : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No installs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{filtered.length} shown</span>
        </div>
      </div>
    </div>
  );
}
