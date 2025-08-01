
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowDown, ArrowUp, History } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import type { Transaction, User } from "@/lib/data"
import { Skeleton } from "./ui/skeleton"
import { PayChanguPayment } from "./paychangu-payment"
import { PayChanguCustomer } from "@/lib/paychangu"

// Utility function to format dates reliably
const formatTransactionDate = (dateInput: any): string => {
  try {
    let dateObj: Date;
    
    if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else if (typeof dateInput === 'string') {
      dateObj = new Date(dateInput);
    } else {
      dateObj = new Date();
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  } catch (error) {
    console.error('Date formatting error:', error, dateInput);
    return 'Invalid Date';
  }
};

type WalletClientProps = {
    user: User | null;
    initialTransactions: Transaction[];
}

export function WalletClient({ user, initialTransactions }: WalletClientProps) {
  const [isClient, setIsClient] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Withdrawal form state
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bank_uuid: '',
    bank_account_number: '',
    bank_account_name: '',
    mobile_money_operator_ref_id: ''
  });

  // Bank and operator data state
  const [banks, setBanks] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Function to fetch banks and operators from PayChangu
  const fetchBanksAndOperators = async () => {
    setLoadingBanks(true);
    try {
      const response = await fetch('/api/paychangu/banks');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allBanks = data.data.banks || [];
          const operators = data.data.operators || [];
          
          // Filter out mobile money operators from banks list
          const actualBanks = allBanks.filter((bank: any) => 
            !bank.name.toLowerCase().includes('mpamba') && 
            !bank.name.toLowerCase().includes('airtel money') &&
            !bank.name.toLowerCase().includes('mobile money') &&
            !bank.name.toLowerCase().includes('mobile')
          );
          
          // Use only the dedicated operators endpoint for mobile money
          const mobileMoneyOperators = operators.map((op: any) => ({
            ref_id: op.ref_id,
            name: op.name,
            type: 'mobile_money',
            source: 'operators'
          }));
          
          setBanks(actualBanks);
          setOperators(mobileMoneyOperators);
          
          // Show warning if banks are not available
          if (actualBanks.length === 0) {
            toast({
              title: "Bank Transfers Unavailable",
              description: "Bank transfers are not currently available. Only mobile money options are shown.",
              variant: "default"
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch banks and operators:', error);
      toast({
        title: "Connection Error",
        description: "Failed to load bank and operator options. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingBanks(false);
    }
  };

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
    
    // Fetch banks and operators when component mounts
    fetchBanksAndOperators();
    
    // Debug: Log transaction dates to help identify issues
    if (initialTransactions.length > 0) {
      console.log('🔍 Transaction dates debug:', initialTransactions.map(tx => ({
        id: tx.id,
        date: tx.date,
        dateType: typeof tx.date,
        formatted: formatTransactionDate(tx.date)
      })));
    }
  }, [user, initialTransactions]);

  const onTransaction = async (type: 'Deposit' | 'Withdrawal') => {
    if (balance === null) return;
    
    const amount = type === 'Deposit' ? parseFloat(depositAmount) : parseFloat(withdrawalForm.amount);
    
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

    // For withdrawals, use the new API with PayChangu transfers
    if (type === 'Withdrawal') {
      // Validate withdrawal form
      if (!withdrawalForm.amount || !withdrawalForm.bank_uuid || !withdrawalForm.bank_account_number || !withdrawalForm.bank_account_name) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields including amount",
          variant: "destructive"
        });
        return;
      }
      
      // Validate amount specifically
      const withdrawalAmount = parseFloat(withdrawalForm.amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive"
        });
        return;
      }

      startTransition(async () => {
        try {
          const response = await fetch('/api/wallet/withdraw', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(withdrawalForm),
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

          // PayChangu transfer was successful
                     toast({
             title: "Withdrawal Initiated Successfully! 🎉",
             description: `Withdrawal of MK ${result.amount.toLocaleString()}.00 has been initiated. Transfer ID: ${result.transfer_id}. Fee: MK ${result.fee.toLocaleString()}.00`,
           });
          setWithdrawOpen(false);
          setWithdrawalForm({
            amount: '',
            bank_uuid: '',
            bank_account_number: '',
            bank_account_name: '',
            mobile_money_operator_ref_id: ''
          });
          refreshUserData(); // Refresh data after successful withdrawal request
        } catch (error) {
          console.error('Withdrawal error:', error);
          toast({
            title: "Withdrawal Error",
            description: "An error occurred while processing your withdrawal",
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
               MK {balance.toLocaleString()}.00
             </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
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
                      placeholder="Enter amount (MWK)"
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
                                         disabled={isPending || !depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0}
                  >
                    {isPending ? 'Processing...' : 'Proceed to Pay Changu'}
                  </PayChanguPayment>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="secondary" className="w-full font-bold py-8 text-lg">
                  <ArrowDown className="mr-2 h-6 w-6" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount and bank details for withdrawal. A 2.5% withdrawal fee will be applied. Funds will be sent via PayChangu transfer.
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
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="col-span-3"
                      placeholder="Enter amount (MWK)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bank-uuid" className="text-right">
                      Bank/Operator
                    </Label>
                    <Select 
                      value={withdrawalForm.bank_uuid} 
                      onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, bank_uuid: value }))}
                      disabled={loadingBanks}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={loadingBanks ? "Loading..." : "Select bank or mobile money operator"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Mobile Money</SelectLabel>
                          {operators.map((operator) => (
                            <SelectItem key={operator.ref_id} value={operator.ref_id}>
                              📱 {operator.name}
                            </SelectItem>
                          ))}
                          {operators.length === 0 && !loadingBanks && (
                            <SelectItem value="" disabled>No mobile money operators available</SelectItem>
                          )}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Banks</SelectLabel>
                          {banks.map((bank) => (
                            <SelectItem key={bank.uuid} value={bank.uuid}>
                              🏦 {bank.name}
                            </SelectItem>
                          ))}
                          {banks.length === 0 && !loadingBanks && (
                            <SelectItem value="" disabled>Bank transfers not available</SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account-number" className="text-right">
                      {operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? 'Phone Number' : 'Account Number'}
                    </Label>
                    <Input
                      id="account-number"
                      type="text"
                      value={withdrawalForm.bank_account_number}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
                      className="col-span-3"
                      placeholder={operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? "e.g., 265991234567" : "e.g., 1234567890"}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account-name" className="text-right">
                      {operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? 'Registered Name' : 'Account Name'}
                    </Label>
                    <Input
                      id="account-name"
                      type="text"
                      value={withdrawalForm.bank_account_name}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bank_account_name: e.target.value }))}
                      className="col-span-3"
                      placeholder={operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? "Name registered on mobile money" : "Full name on bank account"}
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
                    <TableCell>
                      {formatTransactionDate(tx.date)}
                    </TableCell>
                                         <TableCell className="text-right font-medium">MK {tx.amount.toLocaleString()}.00</TableCell>
                     <TableCell className="text-right text-muted-foreground">MK {tx.fee.toLocaleString()}.00</TableCell>
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
