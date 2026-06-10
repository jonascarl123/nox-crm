import type { ReactNode } from "react";

type Tone = "green" | "yellow" | "red" | "gray" | "blue" | "purple" | "slate";

const TONES: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20",
  slate: "bg-slate-700 text-white ring-slate-700/20",
};

const KEYWORD_TONES: Record<string, Tone> = {
  // generic
  complete: "green",
  done: "green",
  approved: "green",
  accepted: "green",
  signed: "green",
  active: "blue",
  in_progress: "yellow",
  sent: "yellow",
  pending: "gray",
  draft: "gray",
  not_sent: "gray",
  overdue: "red",
  // deal stages
  setup: "gray",
  consumption: "blue",
  design: "purple",
  proposal: "yellow",
  financing: "yellow",
  contracting: "blue",
  submitted: "green",
  install: "green",
};

export function toneFor(value: string): Tone {
  return KEYWORD_TONES[value.toLowerCase().replace(/\s+/g, "_")] ?? "gray";
}

export default function StatusBadge({
  children,
  tone,
  value,
}: {
  children?: ReactNode;
  tone?: Tone;
  value?: string;
}) {
  const label = children ?? value ?? "";
  const resolved =
    tone ?? (value ? toneFor(value) : toneFor(String(label)));
  const text =
    typeof label === "string" ? label.replace(/_/g, " ") : label;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${TONES[resolved]}`}
    >
      {text}
    </span>
  );
}
