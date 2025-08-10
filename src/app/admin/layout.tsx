
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
  // Check admin authentication for all pages
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/admin-auth/login");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AdminHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
