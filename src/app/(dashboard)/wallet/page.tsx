
import { WalletClient } from "@/components/wallet-client"
import { getCurrentUser } from "@/lib/data"
import { getUserTransactions } from "@/actions/user";

export default async function WalletPage() {
    const user = await getCurrentUser();
    const transactions = await getUserTransactions();

  return (
    <div className="flex flex-col gap-6">
        <WalletClient user={user} initialTransactions={transactions} />
    </div>
  )
}
