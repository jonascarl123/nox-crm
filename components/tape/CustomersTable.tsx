"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TapeCustomer } from "@/lib/tape/types";
import { PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

const COLUMNS = [
  "Homeowner ID",
  "Customer",
  "Division",
  "Region",
  "Team",
  "Office",
  "City",
  "State",
  "Address",
  "Email",
  "Phone",
  "Stage",
  "Job Status",
  "Closer",
  "Setter",
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

function stageLabel(stage: TapeCustomer["pipelineStage"]): string {
  switch (stage) {
    case "lead":
      return "Lead";
    case "deal":
      return "Deal";
    case "install":
      return "Install";
    case "cancelled":
      return "Cancelled";
  }
}

export default function CustomersTable({
  customers,
}: {
  customers: TapeCustomer[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) =>
      `${c.customerName} ${c.customerEmail} ${c.customerPhone} ${fullAddress(c)} ${c.pid ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [customers, search]);

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${customers.length} total from Tape`}
        action={
          <Link href="/customers/new">
            <Button>+ Create a New Lead</Button>
          </Link>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[1400px] text-sm">
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
              {filtered.map((c) => (
                <tr
                  key={c.tapeRecordId}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                    {c.pid ?? c.tapeRecordId}
                  </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-blue-600">
                      <Link
                        href={`/customers/${c.tapeRecordId}`}
                        className="hover:underline"
                      >
                        {c.customerName ?? "—"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.division ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.region ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.team ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.officeName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.market ?? c.customerCity ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.state ?? c.customerState ?? "—"}
                    </td>
                  <td className="px-4 py-2.5 text-slate-500">{fullAddress(c)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {c.customerEmail ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {c.customerPhone ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <StatusBadge value={c.pipelineStage}>
                      {stageLabel(c.pipelineStage)}
                    </StatusBadge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {c.jobStatus ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {c.closer1 ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {c.setter1 ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                    {c.saleDate ?? "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>
            1 - {filtered.length} of {customers.length} items
          </span>
        </div>
      </div>
    </div>
  );
}
