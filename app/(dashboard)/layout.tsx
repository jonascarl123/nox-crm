import { Suspense } from "react";
import AppShell from "@/components/shell/AppShell";
import TapeTableLoading from "@/components/tape/TapeTableLoading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <Suspense fallback={<TapeTableLoading />}>{children}</Suspense>
    </AppShell>
  );
}
