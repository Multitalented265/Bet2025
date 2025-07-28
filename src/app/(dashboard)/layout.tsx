
import { Header } from "@/components/header";
import { InstantNavigation } from "@/components/instant-navigation";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Add caching for session validation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <InstantNavigation />
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
