
import { WalletClient } from "@/components/wallet-client"
import { getTransactions, getUserById } from "@/lib/data"
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";


export default async function WalletPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      redirect("/");
    }

    const user = await getUserById(session.user.id);
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
