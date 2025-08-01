import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNotificationsClient } from "@/components/admin-notifications-client";

export default async function AdminNotificationsPage() {
  const session = await getAdminSession();
  
  if (!session?.user?.id) {
    return redirect("/admin-auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Notifications</h1>
        <p className="text-muted-foreground">Manage and view all system notifications and alerts.</p>
      </div>
      <AdminNotificationsClient />
    </div>
  );
} 