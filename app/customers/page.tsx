"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { userById, officeById } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

const COLUMNS = [
  "Lead ID",
  "Customer",
  "Office",
  "Lead Source",
  "City",
  "State",
  "Address",
  "Email",
  "Phone",
  "Lead Status",
  "Last Appointment",
  "Referrer",
  "Next Appointment",
  "Lead Owner",
  "Setter",
];

// Deterministic 7-digit lead code from a customer id (stable across renders).
function leadCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return String(3730000 + (h % 9999));
}

function parseCityState(address: string): { city: string; state: string } {
  const parts = address.split(",").map((p) => p.trim());
  const city = parts[1] ?? "";
  const state = (parts[2] ?? "").split(/\s+/)[0] ?? "";
  return { city, state };
}

export default function LeadsPage() {
  const { customers, deals } = useStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.address}`
        .toLowerCase()
        .includes(q)
    );
  }, [customers, search]);

  const ownerFor = (customerId: string) => {
    const deal = deals.find((d) => d.customerId === customerId);
    return userById(deal?.repId);
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${customers.length} total`}
        action={
          <Link href="/customers/new">
            <Button>+ Create a New Lead</Button>
          </Link>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[1500px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {COLUMNS.map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      {col}
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-300"
                      >
                        <path d="M3 4h18l-7 8v6l-4 2v-8z" />
                      </svg>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const { city, state } = parseCityState(c.address);
                const owner = ownerFor(c.id);
                const office = officeById(c.officeId);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                      {leadCode(c.id)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-blue-600">
                      <Link
                        href={`/customers/${c.id}`}
                        className="hover:underline"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {office?.name ?? ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.leadSource ?? ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {city}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {state}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{c.address}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {c.phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      New
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                      —
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                      —
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                      —
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {owner?.name ?? ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                      —
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No leads match your search.
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
