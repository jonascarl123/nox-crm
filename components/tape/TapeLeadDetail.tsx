import Link from "next/link";
import type { TapeCustomer } from "@/lib/tape/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, currency } from "@/lib/format";

function fullAddress(c: TapeCustomer): string {
  return [
    c.customerAddress,
    c.customerCity,
    c.customerState,
    c.customerZip,
  ]
    .filter(Boolean)
    .join(", ");
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

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="font-medium text-slate-600">{label}</dt>
      <dd className="text-right text-slate-900">{value ?? "—"}</dd>
    </div>
  );
}

export default function TapeLeadDetail({ customer }: { customer: TapeCustomer }) {
  const address = fullAddress(customer);
  const mapQuery = encodeURIComponent(address);

  return (
    <div>
      <div className="mb-6 text-sm">
        <Link href="/customers" className="text-blue-600 hover:underline">
          &laquo; Leads
        </Link>
        <span className="text-slate-400"> / {customer.customerName ?? "Lead"}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {customer.customerName ?? "Unknown"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{address || "—"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={stageLabel(customer.pipelineStage)} />
          {customer.jobStatus && (
            <StatusBadge value={customer.jobStatus} />
          )}
          {customer.pipelineStage === "deal" && (
            <Link
              href={`/deals/${customer.tapeRecordId}`}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Open Deal
            </Link>
          )}
          {(customer.pipelineStage === "install" ||
            customer.pipelineStage === "cancelled") && (
            <Link
              href={`/installs/${customer.tapeRecordId}`}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Open Install
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Contact & Project
          </h2>
          <dl className="divide-y divide-slate-100">
            <Field label="Homeowner ID" value={customer.pid ?? String(customer.tapeRecordId)} />
            <Field label="Email" value={customer.customerEmail} />
            <Field label="Phone" value={customer.customerPhone} />
            <Field label="Product" value={customer.productName} />
            <Field label="KW" value={customer.kw != null ? String(customer.kw) : null} />
            <Field
              label="SOW"
              value={customer.sowAmount != null ? currency(customer.sowAmount) : null}
            />
            <Field label="NTP Status" value={customer.ntpAppStatus} />
            <Field label="Sale Date" value={customer.saleDate ? formatDate(customer.saleDate) : null} />
            <Field label="Install Completed" value={customer.installCompletedDate ? formatDate(customer.installCompletedDate) : null} />
            <Field label="Cancel Date" value={customer.cancelDate ? formatDate(customer.cancelDate) : null} />
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Organization
            </h2>
            <dl className="divide-y divide-slate-100">
              <Field label="Division" value={customer.division} />
              <Field label="Region" value={customer.region} />
              <Field label="Team" value={customer.team} />
              <Field label="Office" value={customer.officeName} />
              <Field label="State" value={customer.state ?? customer.customerState} />
              <Field label="Market" value={customer.market ?? customer.customerCity} />
            </dl>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Reps
            </h2>
            <dl className="divide-y divide-slate-100">
              <Field label="Closer" value={customer.closer1} />
              <Field label="Setter" value={customer.setter1} />
              <Field label="Secondary AE" value={customer.closer2} />
            </dl>
          </div>
        </div>
      </div>

      {address && (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <iframe
            title="Lead location"
            width="100%"
            height="280"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=k&z=18&output=embed`}
          />
        </div>
      )}

      {customer.notes && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}
