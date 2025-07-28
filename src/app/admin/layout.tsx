
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";

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
    redirect("/admin-auth/login");
  }

  console.log("✅ Admin session found, rendering admin layout");

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
