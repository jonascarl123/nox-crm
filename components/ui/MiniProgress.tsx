export default function MiniProgress({ value }: { value: number }) {
  const r = 8;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
        <circle
          cx="10"
          cy="10"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          cx="10"
          cy="10"
          r={r}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs font-medium text-slate-600">{value}%</span>
    </span>
  );
}
