import InstallsTable from "@/components/tape/InstallsTable";
import { listTapeInstalls } from "@/lib/tape/queries";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function InstallsPage() {
  const installs = await listTapeInstalls();
  return <InstallsTable installs={installs} />;
}
