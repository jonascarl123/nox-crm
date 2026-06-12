import DealsTable from "@/components/tape/DealsTable";
import { listTapeDeals } from "@/lib/tape/queries";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function DealsPage() {
  const deals = await listTapeDeals();
  return <DealsTable deals={deals} />;
}
