import Link from "next/link";
import { notFound } from "next/navigation";
import TapeDealWorkflow from "@/components/tape/TapeDealWorkflow";
import { getTapeCustomerByRecordId } from "@/lib/tape/queries";
import { getDealWorkflowForTape } from "@/lib/workflow/queries";

export const dynamic = "force-dynamic";

export default async function DealWorkflowPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  const tapeRecordId = Number(dealId);
  if (!Number.isFinite(tapeRecordId)) notFound();

  const customer = await getTapeCustomerByRecordId(tapeRecordId);
  if (!customer) {
    return (
      <div className="text-slate-500">
        Deal not found.{" "}
        <Link href="/deals" className="text-orange-600 hover:underline">
          Back to pipeline
        </Link>
      </div>
    );
  }

  const workflow = await getDealWorkflowForTape(customer);

  return <TapeDealWorkflow customer={customer} workflow={workflow} />;
}
