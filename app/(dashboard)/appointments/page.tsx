"use client";

import { useMemo, useState } from "react";
import {
  appointmentsForUser,
  userById,
  CURRENT_USER_ID,
  APPT_DAYS,
  APPT_HOURS,
  APPT_WEEK_LABEL,
  type Appointment,
} from "@/lib/mock-data";
import Button from "@/components/ui/Button";

function hourLabel(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${period}`;
}

function ApptBlock({ a }: { a: Appointment }) {
  const inHome = a.type === "IN_HOME";
  const rep = userById(a.repId);
  return (
    <div
      title={`${a.title} · ${a.customerName}\n${a.address}\n${rep?.name ?? ""}`}
      className={`mb-1 cursor-pointer overflow-hidden rounded px-1.5 py-1 text-[10px] leading-tight text-white ${
        inHome ? "bg-red-500 hover:bg-red-600" : "bg-sky-500 hover:bg-sky-600"
      }`}
    >
      <p className="font-semibold">{a.title}</p>
      <p className="truncate opacity-90">{a.customerName}</p>
    </div>
  );
}

export default function AppointmentsPage() {
  const user = userById(CURRENT_USER_ID);
  const isAdmin = user?.role === "ADMIN";

  const [showInHome, setShowInHome] = useState(true);
  const [showVirtual, setShowVirtual] = useState(true);
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week");

  const all = useMemo(
    () => appointmentsForUser(user?.role ?? "REP", user?.id ?? ""),
    [user]
  );

  const filtered = all.filter(
    (a) =>
      (a.type === "IN_HOME" && showInHome) ||
      (a.type === "VIRTUAL" && showVirtual)
  );

  const cellAppts = (day: number, hour: number) =>
    filtered.filter((a) => a.day === day && a.hour === hour);

  return (
    <div>
      {/* Heading */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdmin ? "All Company Appointments" : "My Appointments"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Click on an appointment to edit or an open time to create.
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          Company Timezone
          <p className="font-medium text-slate-600">Phoenix</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 4h18M6 8h12M9 12h6M11 16h2" />
          </svg>
          Filters
        </span>

        <span className="text-sm text-slate-500">Types:</span>
        <button
          onClick={() => setShowInHome((s) => !s)}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 transition ${
            showInHome
              ? "bg-red-500 text-white ring-red-500"
              : "bg-white text-slate-500 ring-slate-300"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500 ring-1 ring-white/50" />
          In-Home
        </button>
        <button
          onClick={() => setShowVirtual((s) => !s)}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 transition ${
            showVirtual
              ? "bg-sky-500 text-white ring-sky-500"
              : "bg-white text-slate-500 ring-slate-300"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-500 ring-1 ring-white/50" />
          Virtual
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" className="!py-1.5 text-xs">
            Add Appointment
          </Button>
          <Button variant="secondary" className="!py-1.5 text-xs">
            List View
          </Button>
        </div>
      </div>

      {/* Date nav */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Today
          </button>
          <button className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 hover:bg-slate-50">
            ‹
          </button>
          <button className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 hover:bg-slate-50">
            ›
          </button>
          <span className="ml-2 text-sm font-medium text-slate-700">
            {APPT_WEEK_LABEL}
          </span>
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {(["Day", "Week", "Month"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                viewMode === m
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="scrollbar-thin overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Day headers */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-200">
              <div className="border-r border-slate-100" />
              {APPT_DAYS.map((d, i) => (
                <div
                  key={i}
                  className="border-r border-slate-100 px-2 py-2 text-center last:border-r-0"
                >
                  <p className="text-xs font-semibold text-slate-700">
                    {d.label} {d.date}
                  </p>
                </div>
              ))}
            </div>

            {/* Hour rows */}
            {APPT_HOURS.map((h) => (
              <div
                key={h}
                className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-100 last:border-b-0"
              >
                <div className="border-r border-slate-100 px-2 py-1 text-right text-[11px] text-slate-400">
                  {hourLabel(h)}
                </div>
                {APPT_DAYS.map((_, day) => {
                  const items = cellAppts(day, h);
                  return (
                    <div
                      key={day}
                      className="min-h-14 border-r border-slate-100 p-1 last:border-r-0 hover:bg-slate-50/60"
                    >
                      {items.map((a) => (
                        <ApptBlock key={a.id} a={a} />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Showing {filtered.length} sample appointments
        {isAdmin
          ? " across all reps (admin view)."
          : ` assigned to ${user?.name}.`}
      </p>
    </div>
  );
}
