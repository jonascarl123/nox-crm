export default function TapeTableLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
        Loading…
      </div>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="h-5 w-32 rounded bg-slate-100" />
        </div>
        <div className="h-10 w-full max-w-xs rounded-md bg-slate-100" />
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="space-y-0 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="h-4 w-full rounded bg-slate-200" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 border-b border-slate-50 px-4 py-3 last:border-0"
            >
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-4 flex-1 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
