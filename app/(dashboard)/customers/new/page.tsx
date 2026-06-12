"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  LANGUAGE_OPTIONS,
  LEAD_SOURCES,
  US_STATES,
} from "@/lib/mock-data";

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      {label}
    </label>
  );
}

export default function NewLeadPage() {
  const router = useRouter();
  const { customers, addCustomer, addDeal, offices } = useStore();

  const [f, setF] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    textConsent: false,
    language: "English",
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    ignoreAddress: false,
    officeId: "",
    leadSource: "",
    createDeal: true,
  });
  const [showSecondary, setShowSecondary] = useState(false);
  const [secondary, setSecondary] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const submit = () => {
    const address = [f.street, f.unit, f.city, f.state, f.zip]
      .filter(Boolean)
      .join(", ");
    const created = addCustomer({
      firstName: f.firstName || "New",
      lastName: f.lastName || "Lead",
      email: f.email,
      phone: f.phone,
      address,
      language: f.language,
      leadSource: f.leadSource || undefined,
      officeId: f.officeId || undefined,
      textConsent: f.textConsent,
    });

    if (f.createDeal) {
      const deal = addDeal({
        customerId: created.id,
        repId: "user-2",
        projectAddress: f.street,
        city: f.city,
        state: f.state,
        zip: f.zip,
        installerName: "Nox Power In-House",
        template: "Nox - Standard Residential",
        version: "1 (current)",
      });
      router.push(`/deals/${deal.id}`);
    } else {
      router.push(`/customers/${created.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-800">
            Create a New Lead
          </h1>
        </div>

        <div className="px-6 py-5">
          <p className="mb-6 text-sm text-slate-500">
            Use this form to create one new lead.{" "}
            <span className="cursor-pointer text-blue-600 hover:underline">
              Click here to do a bulk upload.
            </span>
          </p>

          {/* Primary contact */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Primary Contact</h2>
            <button
              onClick={() => setShowSecondary((s) => !s)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              + Secondary Contact
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputCls}
              placeholder="First name"
              value={f.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Last name"
              value={f.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Email"
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Mobile phone"
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          {showSecondary && (
            <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Secondary Contact
              </p>
              <div className="grid grid-cols-2 gap-4">
                <input
                  className={inputCls}
                  placeholder="First name"
                  value={secondary.firstName}
                  onChange={(e) =>
                    setSecondary({ ...secondary, firstName: e.target.value })
                  }
                />
                <input
                  className={inputCls}
                  placeholder="Last name"
                  value={secondary.lastName}
                  onChange={(e) =>
                    setSecondary({ ...secondary, lastName: e.target.value })
                  }
                />
                <input
                  className={inputCls}
                  placeholder="Email"
                  value={secondary.email}
                  onChange={(e) =>
                    setSecondary({ ...secondary, email: e.target.value })
                  }
                />
                <input
                  className={inputCls}
                  placeholder="Mobile phone"
                  value={secondary.phone}
                  onChange={(e) =>
                    setSecondary({ ...secondary, phone: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Check
              checked={f.textConsent}
              onChange={(v) => set("textConsent", v)}
              label="Customer has consented to receive text messages"
            />
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-bold text-slate-800">
              Language Preference
            </label>
            <select
              className={`${inputCls} max-w-xs`}
              value={f.language}
              onChange={(e) => set("language", e.target.value)}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <hr className="my-6 border-slate-100" />

          {/* Project address */}
          <h2 className="mb-3 text-sm font-bold text-slate-800">
            Project Address
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
            <input
              className={inputCls}
              placeholder="Street address"
              value={f.street}
              onChange={(e) => set("street", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Unit/Suite/Apt"
              value={f.unit}
              onChange={(e) => set("unit", e.target.value)}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <input
              className={`${inputCls} w-44`}
              placeholder="City"
              value={f.city}
              onChange={(e) => set("city", e.target.value)}
            />
            <select
              className={`${inputCls} w-28`}
              value={f.state}
              onChange={(e) => set("state", e.target.value)}
            >
              <option value="">-- State --</option>
              {US_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              className={`${inputCls} w-28`}
              placeholder="Zip"
              value={f.zip}
              onChange={(e) => set("zip", e.target.value)}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={f.ignoreAddress}
                onChange={(e) => set("ignoreAddress", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Ignore address correction?
            </label>
          </div>

          <hr className="my-6 border-slate-100" />

          {/* Office + lead source + create deal */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-800">
                  Select Office
                </label>
                <select
                  className={inputCls}
                  value={f.officeId}
                  onChange={(e) => set("officeId", e.target.value)}
                >
                  <option value="">-- Auto Assign by Location --</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-800">
                  Lead Source
                </label>
                <select
                  className={inputCls}
                  value={f.leadSource}
                  onChange={(e) => set("leadSource", e.target.value)}
                >
                  <option value="">-- Lead Source --</option>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-1">
              <Check
                checked={f.createDeal}
                onChange={(v) => set("createDeal", v)}
                label="Create a sales deal?"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M10 8l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => router.push("/customers")}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Cancel and return to Leads
        </button>
      </div>
    </div>
  );
}
