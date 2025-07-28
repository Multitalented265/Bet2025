
import { WalletClient } from "@/components/wallet-client"
import { getTransactions, getUserById } from "@/lib/data"
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PaymentStatus } from "@/components/payment-status";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; tx_ref?: string }>;
}) {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return redirect("/");
    }

    // Await searchParams
    const params = await searchParams;

    // Fetch data in parallel for better performance
    const [user, allTransactions] = await Promise.all([
      getUserById(session.user.id),
      getTransactions()
    ]);

    if (!user) {
      return redirect("/");
    }

    const userTransactions = allTransactions.filter(tx => tx.userId === user.id);

    return (
      <div className="flex flex-col gap-6">
        {params.payment && (
          <PaymentStatus 
            status={params.payment} 
            txRef={params.tx_ref} 
          />
        )}
          <WalletClient user={user} initialTransactions={userTransactions} />
      </div>
    )
}
