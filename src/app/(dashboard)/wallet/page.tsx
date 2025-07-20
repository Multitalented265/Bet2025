import { Header } from "@/components/header"
import { WalletClient } from "@/components/wallet-client"

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-6">
        <Header title="Wallet" />
        <WalletClient />
    </div>
  )
}
