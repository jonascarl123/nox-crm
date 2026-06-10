import Link from "next/link";
import type { Deal } from "@/lib/mock-data";
import { customerName, userById } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

export default function DealCard({ deal }: { deal: Deal }) {
  const rep = userById(deal.repId);
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md hover:ring-orange-200"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-slate-900">
          {customerName(deal.customerId)}
        </p>
        <StatusBadge value={deal.stage} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {deal.projectAddress}, {deal.city}, {deal.state}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          {rep && <Avatar name={rep.name} color={rep.avatarColor} size={22} />}
          <span className="text-xs text-slate-500">{rep?.name ?? "—"}</span>
        </div>
        <span className="text-xs text-slate-400">{deal.installerName}</span>
      </div>
    </Link>
  );
}
