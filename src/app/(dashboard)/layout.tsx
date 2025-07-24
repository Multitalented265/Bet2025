
import { Header } from "@/components/header";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("--- [Dashboard Layout] ---");
  const session = await getSession();
  console.log("[Dashboard Layout] Session object:", session);


  if (!session?.user) {
    console.log("[Dashboard Layout] No session found. Redirecting to login.");
    // This is the single point of truth for protecting the entire dashboard.
    // If no session exists, redirect to the login page.
    redirect("/");
  }

  console.log("[Dashboard Layout] Session is valid. Rendering page.");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
