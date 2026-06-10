"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

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

  const dealCount = (id: string) =>
    deals.filter((d) => d.customerId === id).length;

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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Address</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Deals</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
              >
                <td className="px-5 py-3 font-medium text-slate-900">
                  <Link
                    href={`/customers/${c.id}`}
                    className="hover:underline"
                  >
                    {c.firstName} {c.lastName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-500">{c.email}</td>
                <td className="px-5 py-3 text-slate-500">{c.phone}</td>
                <td className="px-5 py-3 text-slate-500">{c.address}</td>
                <td className="px-5 py-3 text-slate-500">
                  {c.leadSource ?? "—"}
                </td>
                <td className="px-5 py-3 text-slate-500">{dealCount(c.id)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  No leads match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
