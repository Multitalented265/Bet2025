import { redirect } from "next/navigation";

export default function DashboardWalletRedirect({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; tx_ref?: string }>;
}) {
  // Redirect to the actual wallet page
  redirect("/wallet");
} 