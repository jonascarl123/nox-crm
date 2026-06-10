"use client";

import { use } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  userById,
  projectManager,
  installProgress,
  type MilestoneStatus,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

function Panel({
  title,
  icon,
  action,
  children,
  className = "",
}: {
  title?: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            {icon && <span>{icon}</span>}
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

function ProgressNode({
  index,
  label,
  sub,
  status,
}: {
  index: number;
  label: string;
  sub?: string;
  status: MilestoneStatus | "DONE";
}) {
  const done = status === "DONE";
  return (
    <div className="flex min-w-24 flex-col items-center text-center">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold ${
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : status === "IN_PROGRESS"
              ? "border-blue-500 bg-white text-blue-600"
              : "border-slate-300 bg-white text-slate-400"
        }`}
      >
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          index
        )}
      </span>
      <span className="mt-1.5 text-xs font-medium text-slate-700">{label}</span>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
    </div>
  );
}

const quickLinks = [
  "Customer Page",
  "Deal",
  "Deal Summary",
  "Agreement",
  "Proposal",
  "Portal",
];

const breakdownRows = ["Costs", "System Adders", "Value Adders", "Financing", "Rebates"];

export default function InstallDashboardPage({
  params,
}: {
  params: Promise<{ installId: string }>;
}) {
  const { installId } = use(params);
  const { installs, deals, customers } = useStore();
  const install = installs.find((i) => i.id === installId);

  if (!install) {
    return (
      <div className="text-slate-500">
        Install not found.{" "}
        <Link href="/installs" className="text-orange-600 hover:underline">
          Back to installs
        </Link>
      </div>
    );
  }

  const deal = deals.find((d) => d.id === install.dealId);
  const rep = userById(deal?.repId);
  const pm = projectManager(install);
  const customer = customers.find((c) => c.id === deal?.customerId);
  const size = deal?.design?.systemSizeKw;
  const mapQuery = encodeURIComponent(install.address);
  const milestones = [...install.milestones].sort((a, b) => a.order - b.order);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold tracking-tight text-slate-900">
        Install Tracker
      </h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr_300px]">
        {/* Left column */}
        <div className="space-y-5">
          <Panel>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  👤
                </span>
                <div>
                  <p className="font-semibold text-blue-600">
                    {install.customerName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {customer?.email || "no-email@example.com"}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">{install.address}</p>
            <p className="mb-3 text-xs text-slate-500">
              {customer?.phone ?? "(000) 000-0000"}
            </p>
            <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
              <iframe
                title="Roof"
                width="100%"
                height="140"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapQuery}&t=k&z=19&output=embed`}
              />
            </div>
          </Panel>

          <Panel title="Deal Breakdown" icon="▤">
            <div className="mb-3 flex justify-between text-sm">
              <div>
                <p className="text-xs text-slate-400">Size</p>
                <p className="font-semibold text-slate-900">
                  {size ? `${size} kW` : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Created</p>
                <p className="font-semibold text-slate-900">
                  {formatDate(install.createdAt)}
                </p>
              </div>
            </div>
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {breakdownRows.map((r) => (
                <li
                  key={r}
                  className="flex cursor-pointer items-center justify-between py-2.5 text-sm text-slate-600 hover:text-slate-900"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-300">›</span>
                    {r}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Team" icon="👥">
            <p className="text-sm text-slate-400">
              Please add an office to view the team associated.
            </p>
          </Panel>
        </div>

        {/* Middle column */}
        <div className="space-y-5">
          <Panel title="Install Progress" icon="⚑">
            <div className="mb-4 flex items-center justify-end gap-3">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                Active
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {installProgress(install)}%
              </span>
            </div>
            <div className="scrollbar-thin flex items-start gap-2 overflow-x-auto pb-2">
              <ProgressNode
                index={1}
                label="Deal Signed"
                sub={deal?.contract.signedAt ? `Completed ${deal.contract.signedAt}` : "Completed"}
                status="DONE"
              />
              {milestones.map((m, i) => (
                <div key={m.id} className="flex items-start gap-2">
                  <div className="mt-4 h-0.5 w-8 bg-slate-200" />
                  <ProgressNode
                    index={i + 2}
                    label={m.name}
                    sub={
                      m.status === "DONE"
                        ? "Completed"
                        : m.status === "IN_PROGRESS"
                          ? "In progress"
                          : undefined
                    }
                    status={m.status}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex gap-5 border-b border-slate-100 text-sm">
              {["Deal Feed", "Notes (0)", "Details", "Files (0)"].map((t, i) => (
                <button
                  key={t}
                  className={`-mb-px border-b-2 pb-2 font-medium ${
                    i === 0
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="mb-3 text-center text-xs text-slate-400">
              Last Tuesday at 6:49 AM
            </p>
            <div className="mb-4 flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                E
              </span>
              <div>
                <p className="text-sm text-slate-700">
                  The agreement for {install.customerName} has been signed
                </p>
                <p className="text-xs text-slate-400">Enerflo Bot · 6:49 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <input
                placeholder="Type your message"
                className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-slate-300">📎</span>
              <span className="text-slate-300">🙂</span>
            </div>
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Panel title="Project Contacts" icon="🪪">
            <div className="mb-4">
              <p className="text-xs text-slate-400">Project Manager</p>
              {pm ? (
                <p className="text-sm font-medium text-slate-900">{pm.name}</p>
              ) : (
                <button className="text-sm font-medium text-blue-600 hover:underline">
                  ＋ Assign
                </button>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400">Sales Rep</p>
              <p className="text-sm font-medium text-slate-900">{rep?.name}</p>
              <p className="text-xs text-slate-500">{rep?.phone}</p>
              <p className="text-xs text-blue-600">{rep?.email}</p>
            </div>
          </Panel>

          <Panel title="Quick Links" icon="🔗">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {quickLinks.map((l) => (
                <span
                  key={l}
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  {l}
                </span>
              ))}
            </div>
          </Panel>

          <Panel title="Tasks" icon="✓">
            <div className="mb-3 flex gap-4 border-b border-slate-100 text-sm">
              <button className="-mb-px border-b-2 border-blue-600 pb-2 font-medium text-blue-600">
                To Do
              </button>
              <button className="-mb-px border-b-2 border-transparent pb-2 font-medium text-slate-400">
                Recently Completed
              </button>
            </div>
            <div className="flex flex-col items-center py-6 text-slate-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M4 7h16v13H4zM4 7l2-3h12l2 3" />
              </svg>
              <p className="mt-2 text-xs text-slate-400">No Data</p>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/installs`}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          ← Back to Install Tracker
        </Link>
      </div>
    </div>
  );
}
