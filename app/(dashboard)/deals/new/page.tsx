"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

const TEMPLATES = [
  "Axia Solar/Nox - Sales Deal",
  "Nox - Standard Residential",
  "Nox - Battery Backup",
];

const INSTALLERS = ["Axia Solar Corp", "Nox Power In-House", "SunPro Partners"];

export default function NewDealPage() {
  const router = useRouter();
  const { customers, users, addDeal } = useStore();

  const [form, setForm] = useState({
    customerId: customers[0]?.id ?? "",
    repId: users.find((u) => u.role === "REP")?.id ?? users[0]?.id ?? "",
    projectAddress: "840 Medical Center Dr",
    address2: "",
    city: "San Bernardino",
    state: "CA",
    zip: "92411",
    installerName: INSTALLERS[0],
    template: TEMPLATES[0],
    version: "3 (current)",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mapQuery = encodeURIComponent(
    `${form.projectAddress}, ${form.city}, ${form.state} ${form.zip}`
  );

  const save = () => {
    const created = addDeal({
      customerId: form.customerId,
      repId: form.repId,
      projectAddress: form.projectAddress,
      city: form.city,
      state: form.state,
      zip: form.zip,
      installerName: form.installerName,
      template: form.template,
      version: form.version,
    });
    router.push(`/deals/${created.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/deals"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to pipeline
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        Create New Deal
      </h1>

      <Card className="p-6">
        <div className="space-y-5">
          <Field label="Customer" required>
            <Select
              value={form.customerId}
              onChange={(e) => set("customerId", e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Sales Rep" required>
            <Select
              value={form.repId}
              onChange={(e) => set("repId", e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.role}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Project Address (if different than customer mailing address)"
            required
          >
            <Input
              value={form.projectAddress}
              onChange={(e) => set("projectAddress", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Address 2">
              <Input
                value={form.address2}
                onChange={(e) => set("address2", e.target.value)}
                placeholder="Address 2"
              />
            </Field>
            <Field label="City" required>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="State" required>
              <Input
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </Field>
            <Field label="Zipcode" required>
              <Input
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-sm text-slate-500">
              Drag the map to center the marker over the exact project address
            </p>
            <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
              <iframe
                title="Project location"
                width="100%"
                height="280"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapQuery}&t=k&z=18&output=embed`}
              />
            </div>
          </div>

          <Field label="Installer" required>
            <Select
              value={form.installerName}
              onChange={(e) => set("installerName", e.target.value)}
            >
              {INSTALLERS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Deal Template" required>
            <Select
              value={form.template}
              onChange={(e) => set("template", e.target.value)}
            >
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Version" required>
            <Select
              value={form.version}
              onChange={(e) => set("version", e.target.value)}
            >
              <option>3 (current)</option>
              <option>2</option>
              <option>1</option>
            </Select>
          </Field>

          <div className="flex justify-between border-t border-slate-100 pt-5">
            <Link href="/deals">
              <Button variant="secondary">Back</Button>
            </Link>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
