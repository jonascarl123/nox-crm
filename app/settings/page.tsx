"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { officeById, type Role } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { PageHeader, Avatar } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import AccessUsers from "@/components/settings/AccessUsers";

const ROLES: Role[] = ["ADMIN", "OPS", "REP", "SETTER"];
const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9"];

type SettingsTab = "access" | "users" | "offices";

export default function SettingsPage() {
  const { users, offices, addUser } = useStore();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<SettingsTab>(isAdmin ? "access" : "users");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "REP" as Role,
    officeId: offices[0]?.id ?? "",
  });

  const save = () => {
    if (!form.name) return;
    addUser({
      ...form,
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "REP",
      officeId: offices[0]?.id ?? "",
    });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="mb-5 inline-flex rounded-lg bg-slate-100 p-1">
        {((isAdmin
          ? ["access", "users", "offices"]
          : ["users", "offices"]) as SettingsTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "users" ? "Team (demo)" : t}
          </button>
        ))}
      </div>

      {tab === "access" && isAdmin ? (
        <AccessUsers />
      ) : tab === "users" ? (
        <div>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setOpen(true)}>+ Add User</Button>
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Office</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} color={u.avatarColor} size={28} />
                        <span className="font-medium text-slate-900">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <StatusBadge tone="slate">{u.role}</StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {officeById(u.officeId)?.name ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Office</th>
                <th className="px-5 py-3">Timezone</th>
                <th className="px-5 py-3">Members</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {o.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{o.timezone}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {users.filter((u) => u.officeId === o.id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role">
              <Select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Office">
              <Select
                value={form.officeId}
                onChange={(e) => setForm({ ...form, officeId: e.target.value })}
              >
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
