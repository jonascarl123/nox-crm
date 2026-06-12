"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TapeCustomer } from "@/lib/tape/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

const COLUMNS = [
  "View",
  "PID",
  "Customer",
  "Division",
  "Region",
  "Team",
  "Office",
  "Product",
  "Address",
  "Phone",
  "Closer",
  "Setter",
  "NTP Status",
  "Job Status",
  "Stage",
  "KW",
  "SOW",
  "Sale Date",
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

function formatMoney(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DealsTable({ deals }: { deals: TapeCustomer[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(25);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const d of deals) {
      if (d.jobStatus) set.add(d.jobStatus);
    }
    return Array.from(set).sort();
  }, [deals]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return deals.filter((d) => {
      const hay =
        `${d.customerName} ${d.pid} ${fullAddress(d)} ${d.customerPhone ?? ""} ${d.closer1 ?? ""} ${d.jobStatus ?? ""}`.toLowerCase();
      return (
        hay.includes(q) &&
        (statusFilter === "all" || d.jobStatus === statusFilter)
      );
    });
  }, [deals, search, statusFilter]);

  const page = filtered.slice(0, pageSize);

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Company Deals
        </h1>
        <Link href="/customers/new">
          <Button className="!py-1.5 text-xs">+ New Lead</Button>
        </Link>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Ongoing sold deals from Tape — not yet closed
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm shadow-sm focus:outline-none"
        >
          <option value="all">All job statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
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
              {page.map((d) => (
                <tr
                  key={d.tapeRecordId}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/deals/${d.tapeRecordId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") router.push(`/deals/${d.tapeRecordId}`);
                  }}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <Link
                      href={`/deals/${d.tapeRecordId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-700">
                    {d.pid ?? d.tapeRecordId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-blue-600">
                    <Link
                      href={`/deals/${d.tapeRecordId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {d.customerName ?? "—"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.division ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.region ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.team ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.officeName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.productName ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{fullAddress(d)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.customerPhone ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-blue-600">
                    {d.closer1 ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.setter1 ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.ntpAppStatus ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {d.jobStatus ? (
                      <StatusBadge value={d.jobStatus} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <StatusBadge
                      tone={d.pipelineStage === "cancelled" ? "red" : "blue"}
                      value={d.pipelineStage}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.kw ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {formatMoney(d.sowAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {d.saleDate ? formatDate(d.saleDate) : "—"}
                  </td>
                </tr>
              ))}
              {page.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No deals match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border border-slate-200 px-2 py-1"
          >
            {[25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <span>
            1 - {page.length} of {filtered.length} items
          </span>
        </div>
      </div>
    </div>
  );
}
