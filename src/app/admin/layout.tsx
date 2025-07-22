
import { AdminHeader } from "@/components/admin-header";
import { BetProvider } from "@/context/bet-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BetProvider>
      <div className="flex min-h-screen w-full flex-col">
        <AdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </BetProvider>
  );
}
