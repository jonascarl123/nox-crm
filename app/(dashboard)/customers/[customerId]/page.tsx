import Link from "next/link";
import { notFound } from "next/navigation";
import TapeLeadDetail from "@/components/tape/TapeLeadDetail";
import { getTapeCustomerByRecordId } from "@/lib/tape/queries";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const tapeRecordId = Number(customerId);
  if (!Number.isFinite(tapeRecordId)) notFound();

  const customer = await getTapeCustomerByRecordId(tapeRecordId);
  if (!customer) {
    return (
      <div className="text-slate-500">
        Lead not found.{" "}
        <Link href="/customers" className="text-orange-600 hover:underline">
          Back to leads
        </Link>
      </div>
    );
  }

  return <TapeLeadDetail customer={customer} />;
}
