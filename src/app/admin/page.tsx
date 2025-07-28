import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/admin-auth/login");
  }
  
  redirect("/admin/dashboard");
} 