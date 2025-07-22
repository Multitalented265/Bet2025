
"use client"

import { useState, useTransition, useEffect } from "react"
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
import { ArrowDown, ArrowUp, History } from "lucide-react"
import { handleTransaction, getUserTransactions } from "@/actions/user"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import type { Transaction } from "@/lib/data"

export function WalletClient() {
  const [balance, setBalance] = useState(50000)
  const [depositAmount, setDepositAmount] = useState("1000")
  const [withdrawAmount, setWithdrawAmount] = useState("1000")
  const [isDepositOpen, setDepositOpen] = useState(false)
  const [isWithdrawOpen, setWithdrawOpen] = useState(false)
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast()

  useEffect(() => {
    async function fetchTransactions() {
        const userTransactions = await getUserTransactions();
        setTransactions(userTransactions);
    }
    fetchTransactions();
  }, [isPending]); // Refetch transactions after a new one is made

  const onTransaction = (type: 'Deposit' | 'Withdrawal') => {
    const amount = type === 'Deposit' ? parseFloat(depositAmount) : parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount" });
      return;
    }
    
    if (type === 'Withdrawal' && amount > balance) {
        toast({ variant: "destructive", title: "Insufficient Funds" });
        return;
    }

    startTransition(async () => {
      await handleTransaction(type, amount);
      setBalance(prev => type === 'Deposit' ? prev + amount : prev - amount);
      toast({
        title: `${type} Successful`,
        description: `Your transaction has been processed.`,
      });
      if (type === 'Deposit') setDepositOpen(false);
      if (type === 'Withdrawal') setWithdrawOpen(false);
    });
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
          <div className="p-6 rounded-lg bg-primary text-primary-foreground">
            <h3 className="text-lg opacity-80">Current Balance</h3>
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
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., 5000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => onTransaction('Deposit')} type="submit" disabled={isPending}>
                    {isPending ? 'Processing...' : 'Proceed to Pay Changu'}
                  </Button>
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
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., 1000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => onTransaction('Withdrawal')} type="submit" disabled={isPending}>
                    {isPending ? 'Processing...' : 'Request Withdrawal'}
                  </Button>
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
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono">{tx.id}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'Deposit' ? 'secondary' : 'outline'} className="capitalize">
                        {tx.type === 'Deposit' 
                          ? <ArrowUp className="mr-1 h-3 w-3 text-green-500" /> 
                          : <ArrowDown className="mr-1 h-3 w-3 text-red-500" />}
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(tx.date + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="text-right font-medium">{tx.amount.toLocaleString()} MWK</TableCell>
                    <TableCell className="text-right text-muted-foreground">{tx.fee.toLocaleString()} MWK</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <History className="mx-auto h-12 w-12" />
                <p className="mt-4">No recent transactions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
