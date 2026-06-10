"use client";

import { use } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { userById, officeById, LEAD_SOURCES } from "@/lib/mock-data";
import StatusBadge from "@/components/ui/StatusBadge";

function CardBox({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="text-slate-400">{icon}</span>
          {title}
        </h3>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function NewBtn() {
  return (
    <button className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 5v14M5 12h14" />
      </svg>
      New
    </button>
  );
}

const selectCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = use(params);
  const { customers, deals, tasks, users, offices } = useStore();
  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <div className="text-slate-500">
        Lead not found.{" "}
        <Link href="/customers" className="text-orange-600 hover:underline">
          Back to leads
        </Link>
      </div>
    );
  }

  const customerDeals = deals.filter((d) => d.customerId === customerId);
  const customerTasks = tasks.filter(
    (t) => t.linkedType === "customer" && t.linkedId === customerId
  );
  const rep = userById(customerDeals[0]?.repId) ?? users.find((u) => u.role === "REP");
  const office = officeById(customer.officeId);
  const mapQuery = encodeURIComponent(customer.address);
  const emailInvalid = !customer.email;

  return (
    <div className="-m-6">
      {/* Breadcrumb */}
      <div className="bg-slate-100 px-6 py-2.5 text-sm">
        <Link href="/customers" className="text-blue-600 hover:underline">
          &laquo; Leads
        </Link>
        <span className="text-slate-400">
          {" "}
          / {customer.firstName} {customer.lastName}
        </span>
      </div>

      <div className="space-y-6 p-6">
        {emailInvalid && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            <span>⚠️</span>
            The customer email is invalid and will not receive emails.
          </div>
        )}

        {/* Top card */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: info */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  👤
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {customer.firstName} {customer.lastName}
                </h2>
                <span className="cursor-pointer text-blue-500">✎</span>
              </div>
              <div className="mb-3 flex gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-700 text-xs text-white">
                  ✓
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded bg-red-500 text-xs text-white">
                  ✕
                </span>
              </div>
              <p className="mb-4 text-sm font-medium text-blue-600">
                {customer.address}
              </p>
              <dl className="space-y-2 text-sm">
                {[
                  ["Created on", "06/10/2026"],
                  ["Created by", "Unknown"],
                  ["Date of 1st Contact", "N/A"],
                  ["Date of Last Contact", "N/A"],
                  [
                    "SMS Opt-In Status",
                    customer.textConsent ? "Opt-In" : "Opt-Out",
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="font-semibold text-slate-700">{k}:</dt>
                    <dd className="text-slate-500">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Middle: assignment dropdowns */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  ◈ Office:
                </label>
                <select className={selectCls} defaultValue={office?.id ?? ""}>
                  <option value="">-- Office --</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  👤 Sales Rep:
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {rep?.name ?? "Unassigned"}
                  </span>
                  <button className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50">
                    ✎ Edit
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  👥 Setter:
                </label>
                <select className={selectCls} defaultValue="">
                  <option value="">-- Setter --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  📶 Status:
                </label>
                <select className={selectCls} defaultValue="">
                  <option value="">-- Select Status --</option>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Appointment Set</option>
                  <option>Sold</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  ⚓ Source:
                </label>
                <select
                  className={selectCls}
                  defaultValue={customer.leadSource ?? ""}
                >
                  <option value="">-- Lead Source --</option>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: map */}
            <div>
              <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                <iframe
                  title="Lead location"
                  width="100%"
                  height="200"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=k&z=18&output=embed`}
                />
              </div>
              <div className="mt-2 text-right">
                <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  📍 Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <CardBox title="Deals" icon="＄" action={<NewBtn />}>
              {customerDeals.length === 0 ? (
                <p className="text-sm text-slate-400">No deals.</p>
              ) : (
                <ul className="space-y-2">
                  {customerDeals.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/deals/${d.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {d.code} · {d.projectAddress}
                      </Link>
                      <StatusBadge value={d.stage} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBox>

            <CardBox
              title="Future Appointments"
              icon="📅"
              action={<NewBtn />}
            >
              <p className="mb-2 text-xs text-slate-400">
                In customer&apos;s timezone - Central time
              </p>
              <div className="rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No appointments scheduled
              </div>
            </CardBox>

            <CardBox title="Past Appointments" icon="📅">
              <p className="mb-2 text-xs text-slate-400">
                In customer&apos;s timezone - Central time
              </p>
              <div className="rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No past apts scheduled
              </div>
            </CardBox>

            <CardBox title="Cancelled Appointments" icon="📅">
              <p className="mb-2 text-xs text-slate-400">
                In customer&apos;s timezone - Central time
              </p>
              <div className="rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No cancelled apts
              </div>
            </CardBox>
          </div>

          <div className="space-y-6">
            <CardBox title="Tasks" icon="☰" action={<NewBtn />}>
              <p className="mb-1 text-sm font-medium text-slate-600">
                Pending Tasks
              </p>
              {customerTasks.length === 0 ? (
                <p className="text-sm text-slate-400">No Tasks</p>
              ) : (
                <ul className="space-y-1.5">
                  {customerTasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${t.completed ? "bg-emerald-500" : "bg-amber-400"}`}
                      />
                      {t.title}
                    </li>
                  ))}
                </ul>
              )}
            </CardBox>

            <CardBox title="Notes & Activities" icon="🗒" action={<NewBtn />}>
              <p className="text-sm text-slate-400">No notes yet.</p>
            </CardBox>
          </div>
        </div>
      </div>
    </div>
  );
}
