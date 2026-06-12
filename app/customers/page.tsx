import CustomersTable from "@/components/tape/CustomersTable";
import { listTapeCustomers } from "@/lib/tape/queries";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function CustomersPage() {
  const customers = await listTapeCustomers();
  return <CustomersTable customers={customers} />;
}
