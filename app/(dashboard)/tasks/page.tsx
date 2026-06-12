"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { userById, CURRENT_USER_ID } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, isOverdue } from "@/lib/format";

export default function TasksPage() {
  const { tasks, customers, installs, addTask, toggleTask } = useStore();
  const user = userById(CURRENT_USER_ID);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    linkedType: "customer" as "customer" | "install" | "deal",
    linkedId: "",
  });

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);
  const pending = myTasks.filter((t) => !t.completed);
  const completed = myTasks.filter((t) => t.completed);

  const linkOptions =
    form.linkedType === "install"
      ? installs.map((i) => ({ id: i.id, label: i.customerName }))
      : customers.map((c) => ({
          id: c.id,
          label: `${c.firstName} ${c.lastName}`,
        }));

  const save = () => {
    if (!form.title || !user) return;
    const linked = linkOptions.find((o) => o.id === form.linkedId);
    addTask({
      title: form.title,
      dueDate: form.dueDate || new Date().toISOString().slice(0, 10),
      assigneeId: user.id,
      completed: false,
      linkedType: form.linkedType,
      linkedId: form.linkedId || linkOptions[0]?.id || "",
      linkedLabel: linked?.label ?? linkOptions[0]?.label ?? "—",
    });
    setForm({ title: "", dueDate: "", linkedType: "customer", linkedId: "" });
    setOpen(false);
  };

  const TaskRow = ({ id }: { id: string }) => {
    const t = myTasks.find((x) => x.id === id)!;
    const overdue = !t.completed && isOverdue(t.dueDate);
    return (
      <div className="flex items-center gap-3 px-5 py-3.5">
        <button
          onClick={() => toggleTask(t.id)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
            t.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 hover:border-orange-400"
          }`}
        >
          {t.completed && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${t.completed ? "text-slate-400 line-through" : "text-slate-900"}`}
          >
            {t.title}
          </p>
          <p className="text-xs text-slate-400">{t.linkedLabel}</p>
        </div>
        {overdue && <StatusBadge tone="red">Overdue</StatusBadge>}
        <span
          className={`text-xs ${overdue ? "font-semibold text-red-600" : "text-slate-400"}`}
        >
          {formatDate(t.dueDate)}
        </span>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${pending.length} open · ${completed.length} completed`}
        action={<Button onClick={() => setOpen(true)}>+ Create Task</Button>}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Open
          </div>
          {pending.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">No open tasks. 🎉</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {pending.map((t) => (
                <TaskRow key={t.id} id={t.id} />
              ))}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Completed
            </div>
            <div className="divide-y divide-slate-50">
              {completed.map((t) => (
                <TaskRow key={t.id} id={t.id} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save Task</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Schedule site survey"
            />
          </Field>
          <Field label="Due Date">
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Linked To">
              <Select
                value={form.linkedType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    linkedType: e.target.value as typeof form.linkedType,
                    linkedId: "",
                  })
                }
              >
                <option value="customer">Customer</option>
                <option value="install">Install</option>
              </Select>
            </Field>
            <Field label="Record">
              <Select
                value={form.linkedId}
                onChange={(e) =>
                  setForm({ ...form, linkedId: e.target.value })
                }
              >
                {linkOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
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
