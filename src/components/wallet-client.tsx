
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import type { Transaction, User } from "@/lib/data"
import { Skeleton } from "./ui/skeleton"
import { PayChanguPayment } from "./paychangu-payment"
import { PayChanguCustomer } from "@/lib/paychangu"

type WalletClientProps = {
    user: User | null;
    initialTransactions: Transaction[];
}

export function WalletClient({ user, initialTransactions }: WalletClientProps) {
  const [isClient, setIsClient] = useState(false);
  const [balance, setBalance] = useState<number | null>(user?.balance ?? null);
  const [depositAmount, setDepositAmount] = useState("1000");
  const [withdrawAmount, setWithdrawAmount] = useState("1000");
  const [isDepositOpen, setDepositOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const { toast } = useToast();

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/user/wallet-data');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Handle URL parameters for payment status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const txRef = urlParams.get('tx_ref');

      // Add debug logging to identify where paymentDetails null is coming from
      console.log('🔍 URL Parameters Check:', {
        paymentStatus,
        txRef,
        hasPaymentStatus: !!paymentStatus,
        hasTxRef: !!txRef
      });

      if (paymentStatus && txRef) {
        if (paymentStatus === 'success') {
          toast({
            title: "Payment Successful! 🎉",
            description: `Your deposit has been processed successfully. Transaction: ${txRef}`,
          });
          // Refresh user data to show updated balance
          refreshUserData();
        } else if (paymentStatus === 'failed') {
          toast({
            title: "Payment Failed ❌",
            description: `Your payment was not successful. Transaction: ${txRef}`,
            variant: "destructive"
          });
        }

        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment');
        newUrl.searchParams.delete('tx_ref');
        window.history.replaceState({}, '', newUrl.toString());
      } else {
        // Log when no payment parameters are found (this might be the source of paymentDetails null)
        console.log('📋 No payment parameters found in URL');
      }
    }
  }, [toast]);

   useEffect(() => {
    setIsClient(true);
    setBalance(user?.balance ?? null);
    setTransactions(initialTransactions);
  }, [user, initialTransactions]);

  const onTransaction = async (type: 'Deposit' | 'Withdrawal') => {
    if (balance === null) return;
    
    const amount = type === 'Deposit' ? parseFloat(depositAmount) : parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount" });
      return;
    }
    
    if (type === 'Withdrawal' && amount > balance) {
        toast({ variant: "destructive", title: "Insufficient Funds" });
        return;
    }

    if (type === 'Deposit') {
      // For deposits, use the existing PayChangu flow
      setDepositOpen(false);
      return;
    }

    // For withdrawals, use the new API
    if (type === 'Withdrawal') {
      startTransition(async () => {
        try {
          const response = await fetch('/api/wallet/withdraw', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
          });

          const result = await response.json();

          if (!response.ok) {
            toast({
              title: "Withdrawal Failed",
              description: result.error || "Failed to process withdrawal",
              variant: "destructive"
            });
            return;
          }

                      // Initiate PayChangu withdrawal
            if (result.paychangu_data) {
              // You can implement PayChangu withdrawal here
              // For now, just show success message
              toast({
                title: "Withdrawal Requested",
                description: `Withdrawal of ${result.amount} MWK has been requested. Fee: ${result.fee} MWK`,
              });
              setWithdrawOpen(false);
              refreshUserData(); // Refresh data after successful withdrawal request
            }
        } catch (error) {
          console.error('Withdrawal error:', error);
          toast({
            title: "Withdrawal Error",
            description: "Failed to process withdrawal request",
            variant: "destructive"
          });
        }
      });
    }
  }

  // Don't render until client-side to prevent hydration mismatches
  if (!isClient) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">My Wallet</CardTitle>
            <CardDescription>
              Loading...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
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
            {balance === null ? (
              <Skeleton className="h-12 w-1/2 mt-2" />
            ) : (
              <p className="text-5xl font-bold font-headline">
                {balance.toLocaleString()} MWK
              </p>
            )}
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
                  <PayChanguPayment
                    amount={parseFloat(depositAmount)}
                    customer={{
                      email: user?.email || '',
                      first_name: user?.name?.split(' ')[0] || '',
                      last_name: user?.name?.split(' ').slice(1).join(' ') || '',
                    }}
                    userId={user?.id || ''}
                    transactionType="Deposit"
                    onSuccess={() => {
                      setDepositOpen(false);
                      refreshUserData(); // Refresh data after successful deposit
                      toast({
                        title: "Payment Successful",
                        description: "Your deposit has been processed successfully.",
                      });
                    }}
                    onError={(error) => {
                      toast({
                        title: "Payment Error",
                        description: error,
                        variant: "destructive"
                      });
                    }}
                    disabled={isPending || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0}
                  >
                    {isPending ? 'Processing...' : 'Proceed to Pay Changu'}
                  </PayChanguPayment>
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
                  <Button onClick={() => onTransaction('Withdrawal')} type="submit" disabled={isPending || balance === null}>
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
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <Badge 
                        variant={
                          tx.status === 'completed' ? 'default' : 
                          tx.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                        className="capitalize"
                      >
                        {tx.status || 'pending'}
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
