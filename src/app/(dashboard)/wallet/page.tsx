
import { WalletClient } from "@/components/wallet-client"
import { getCurrentUser, getTransactions } from "@/lib/data"
import { redirect } from "next/navigation";


export default async function WalletPage() {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect("/");
    }

    const allTransactions = await getTransactions();
    const userTransactions = allTransactions.filter(tx => tx.userId === user.id);

  return (
    <div className="flex flex-col gap-6">
        <WalletClient user={user} initialTransactions={userTransactions} />
    </div>
  )
}
