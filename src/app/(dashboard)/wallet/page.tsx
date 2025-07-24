
import { WalletClient } from "@/components/wallet-client"
import { getTransactions, getUserById } from "@/lib/data"
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";


export default async function WalletPage() {
    const session = await getSession();
    // The layout protects this page, so we can assume session and user exist.
    // If not, redirecting is a safe fallback.
    if (!session?.user?.id) {
      return redirect("/");
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return redirect("/");
    }

    const allTransactions = await getTransactions();
    const userTransactions = allTransactions.filter(tx => tx.userId === user.id);

  return (
    <div className="flex flex-col gap-6">
        <WalletClient user={user} initialTransactions={userTransactions} />
    </div>
  )
}
