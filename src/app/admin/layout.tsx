
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🔍 Checking admin session...");
  
  // Check admin authentication for all pages
  const session = await getAdminSession();
  console.log("📋 Admin session result:", session);
  
  if (!session) {
    console.log("❌ No admin session found, redirecting to login");
    redirect("/admin/(auth)/login");
  }

  console.log("✅ Admin session found, rendering admin layout");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AdminHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
