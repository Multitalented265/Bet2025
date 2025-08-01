import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For auth routes, check if user is already logged in and redirect to dashboard
  const session = await getAdminSession();
  
  if (session) {
    console.log("✅ Admin already logged in, redirecting to dashboard");
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 