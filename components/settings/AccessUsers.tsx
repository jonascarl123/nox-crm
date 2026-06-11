"use client";

import { useEffect, useState, useTransition } from "react";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  addAccessUser,
  listAccessUsers,
  removeAccessUser,
  sendLoginCode,
  type AccessUser,
} from "@/app/settings/access-actions";

export default function AccessUsers() {
  const [usersList, setUsersList] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    role: "member" as "admin" | "member",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = () => {
    setLoading(true);
    listAccessUsers()
      .then((u) => {
        setUsersList(u);
        setLoadError(null);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const save = () => {
    setFormError(null);
    startTransition(async () => {
      const res = await addAccessUser(form);
      if ("error" in res) {
        setFormError(res.error);
        return;
      }
      setForm({ email: "", fullName: "", role: "member" });
      setOpen(false);
      setFlash(`Added ${form.email.trim().toLowerCase()}.`);
      reload();
    });
  };

  const emailCode = (email: string) => {
    setFlash(null);
    startTransition(async () => {
      const res = await sendLoginCode(email);
      setFlash(
        "error" in res
          ? `Couldn't send code: ${res.error}`
          : `Login code emailed to ${email}.`
      );
    });
  };

  const remove = (u: AccessUser) => {
    setFlash(null);
    startTransition(async () => {
      const res = await removeAccessUser(u.id);
      if ("error" in res) {
        setFlash(res.error);
        return;
      }
      setFlash(`Removed ${u.email}.`);
      reload();
    });
  };

  if (loadError) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-600/20">
        {loadError}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          People who can sign in. They log in with a one-time code emailed to
          them — no passwords, invite-only.
        </p>
        <Button onClick={() => setOpen(true)}>+ Add User</Button>
      </div>

      {flash && (
        <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          {flash}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : usersList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                  No users yet. Add one to grant access.
                </td>
              </tr>
            ) : (
              usersList.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {u.email}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {u.fullName ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={u.role === "admin" ? "purple" : "slate"}>
                      {u.role}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => emailCode(u.email)}
                        disabled={pending}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                      >
                        Email code
                      </button>
                      <button
                        onClick={() => remove(u)}
                        disabled={pending}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? "Adding…" : "Add User"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-600/20">
              {formError}
            </div>
          )}
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@noxpwr.com"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Field>
            <Field label="Role">
              <Select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as "admin" | "member",
                  })
                }
              >
                <option value="member">member</option>
                <option value="admin">admin</option>
              </Select>
            </Field>
          </div>
          <p className="text-xs text-slate-400">
            The user is added to the allow-list. They sign in at the login page
            with a code emailed to them. Use “Email code” to send one now.
          </p>
        </div>
      </Modal>
    </div>
  );
}
