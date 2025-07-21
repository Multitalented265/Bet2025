
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowDown, ArrowUp } from "lucide-react"

export function WalletClient() {
  const [balance, setBalance] = useState(50000)
  const [depositAmount, setDepositAmount] = useState(1000)
  const [withdrawAmount, setWithdrawAmount] = useState(1000)
  const [isDepositOpen, setDepositOpen] = useState(false)
  const [isWithdrawOpen, setWithdrawOpen] = useState(false)
  const { toast } = useToast()

  const handleDeposit = () => {
    setBalance(balance + Number(depositAmount))
    toast({
      title: "Deposit Successful",
      description: `Your balance has been updated.`,
    })
    setDepositOpen(false)
  }

  const handleWithdraw = () => {
    if (withdrawAmount > balance) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "You cannot withdraw more than your current balance.",
      })
      return
    }
    setBalance(balance - Number(withdrawAmount))
    toast({
      title: "Withdrawal Requested",
      description: "Your withdrawal request has been submitted for processing.",
    })
    setWithdrawOpen(false)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">My Wallet</CardTitle>
          <CardDescription>
            Manage your funds and transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 rounded-lg bg-primary-gradient text-white">
            <h3 className="text-lg text-white/80">Current Balance</h3>
            <p className="text-5xl font-bold font-headline">
              {balance.toLocaleString()} MWK
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog open={isDepositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full font-bold py-8 text-lg">
                  <ArrowUp className="mr-2 h-6 w-6" /> Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you wish to deposit. A 2.5% deposit fee will be applied. You will be redirected to Pay Changu to complete the payment.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deposit-amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="col-span-3"
                      placeholder="e.g., 5000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleDeposit} type="submit">Proceed to Pay Changu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isWithdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="secondary" className="w-full font-bold py-8 text-lg">
                  <ArrowDown className="mr-2 h-6 w-6" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you wish to withdraw. A 2.5% withdrawal fee will be applied. Funds will be sent to your registered payment method.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="withdraw-amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="col-span-3"
                      placeholder="e.g., 1000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleWithdraw} type="submit">Request Withdrawal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Transaction History</CardTitle>
            <CardDescription>A record of your recent deposits and withdrawals.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>No recent transactions.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
