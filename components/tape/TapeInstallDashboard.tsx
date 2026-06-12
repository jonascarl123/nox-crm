import Link from "next/link";
import type { TapeCustomer } from "@/lib/tape/types";
import { fullAddress } from "@/lib/tape/address";
import {
  deriveInstallMilestones,
  installProgressPercent,
  type MilestoneStatus,
} from "@/lib/tape/install-milestones";
import StatusBadge from "@/components/ui/StatusBadge";
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
    <div
      className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 ${className}`}
    >
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
          index
        )}
      </span>
      <span className="mt-1.5 text-xs font-medium text-slate-700">{label}</span>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
    </div>
  );
}

const quickLinks = [
  { label: "Customer Page", href: (id: number) => `/customers/${id}` },
  { label: "Deal", href: (id: number) => `/deals/${id}` },
];

const breakdownRows = ["Costs", "System Adders", "Value Adders", "Financing", "Rebates"];

export default function TapeInstallDashboard({
  customer,
}: {
  customer: TapeCustomer;
}) {
  const address = fullAddress(customer);
  const mapQuery = encodeURIComponent(address);
  const milestones = deriveInstallMilestones(customer);
  const progress = installProgressPercent(milestones);
  const isCancelled = customer.pipelineStage === "cancelled";

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold tracking-tight text-slate-900">
        Install Tracker
      </h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr_300px]">
        <div className="space-y-5">
          <Panel>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  👤
                </span>
                <div>
                  <Link
                    href={`/customers/${customer.tapeRecordId}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {customer.customerName ?? "Unknown"}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {customer.customerEmail ?? "—"}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">{address || "—"}</p>
            <p className="mb-3 text-xs text-slate-500">
              {customer.customerPhone ?? "—"}
            </p>
            {address && (
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
            )}
          </Panel>

          <Panel title="Deal Breakdown" icon="▤">
            <div className="mb-3 flex justify-between text-sm">
              <div>
                <p className="text-xs text-slate-400">Size</p>
                <p className="font-semibold text-slate-900">
                  {customer.kw != null ? `${customer.kw} kW` : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Sale date</p>
                <p className="font-semibold text-slate-900">
                  {customer.saleDate ? formatDate(customer.saleDate) : "—"}
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
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Office</dt>
                <dd className="font-medium text-slate-900">
                  {customer.officeName ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Division</dt>
                <dd className="font-medium text-slate-900">
                  {customer.division ?? "—"}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Install Progress" icon="⚑">
            <div className="mb-4 flex items-center justify-end gap-3">
              <StatusBadge
                tone={isCancelled ? "red" : "green"}
                value={isCancelled ? "Cancelled" : "Active"}
              />
              <span className="text-xs font-semibold text-blue-600">
                {progress}%
              </span>
            </div>
            <div className="scrollbar-thin flex items-start gap-2 overflow-x-auto pb-2">
              <ProgressNode
                index={1}
                label="Deal Signed"
                sub={
                  customer.saleDate
                    ? `Completed ${formatDate(customer.saleDate)}`
                    : undefined
                }
                status={customer.saleDate ? "DONE" : "PENDING"}
              />
              {milestones.map((m, i) => (
                <div key={m.name} className="flex items-start gap-2">
                  <div className="mt-4 h-0.5 w-8 bg-slate-200" />
                  <ProgressNode
                    index={i + 2}
                    label={m.name}
                    sub={m.sub}
                    status={m.status}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex gap-5 border-b border-slate-100 text-sm">
              {["Deal Feed", "Notes", "Details", "Files"].map((t, i) => (
                <button
                  key={t}
                  type="button"
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

            {customer.notes ? (
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {customer.notes}
              </p>
            ) : (
              <p className="text-center text-sm text-slate-400">
                No activity yet — synced from Tape.
              </p>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Project Contacts" icon="🪪">
            <div className="mb-4">
              <p className="text-xs text-slate-400">Closer</p>
              <p className="text-sm font-medium text-slate-900">
                {customer.closer1 ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Setter</p>
              <p className="text-sm font-medium text-slate-900">
                {customer.setter1 ?? "—"}
              </p>
            </div>
          </Panel>

          <Panel title="Quick Links" icon="🔗">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {quickLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href(customer.tapeRecordId)}
                  className="text-blue-600 hover:underline"
                >
                  {l.label}
                </Link>
              ))}
              <span className="text-slate-400">Agreement</span>
              <span className="text-slate-400">Proposal</span>
            </div>
          </Panel>

          <Panel title="Project Info" icon="ℹ">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Job Status</dt>
                <dd>{customer.jobStatus ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">NTP Status</dt>
                <dd>{customer.ntpAppStatus ?? "—"}</dd>
              </div>
              {customer.cancelDate && (
                <div>
                  <dt className="text-xs text-slate-400">Cancel Date</dt>
                  <dd>{formatDate(customer.cancelDate)}</dd>
                </div>
              )}
              {customer.installCompletedDate && (
                <div>
                  <dt className="text-xs text-slate-400">Install Completed</dt>
                  <dd>{formatDate(customer.installCompletedDate)}</dd>
                </div>
              )}
            </dl>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href="/installs"
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          ← Back to Install Tracker
        </Link>
      </div>
    </div>
  );
}
