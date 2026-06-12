import Link from "next/link";
import { notFound } from "next/navigation";
import TapeInstallDashboard from "@/components/tape/TapeInstallDashboard";
import { getTapeCustomerByRecordId } from "@/lib/tape/queries";
import { getInstallWorkflowForTape } from "@/lib/workflow/queries";

export const dynamic = "force-dynamic";

export default async function InstallDashboardPage({
  params,
}: {
  params: Promise<{ installId: string }>;
}) {
  const { installId } = await params;
  const tapeRecordId = Number(installId);
  if (!Number.isFinite(tapeRecordId)) notFound();

  const customer = await getTapeCustomerByRecordId(tapeRecordId);
  if (!customer) {
    return (
      <div className="text-slate-500">
        Install not found.{" "}
        <Link href="/installs" className="text-orange-600 hover:underline">
          Back to installs
        </Link>
      </div>
    );
  }

  const workflow = await getInstallWorkflowForTape(customer);

  return (
    <TapeInstallDashboard customer={customer} workflow={workflow} />
  );
}
