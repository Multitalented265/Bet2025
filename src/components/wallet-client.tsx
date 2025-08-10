
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
import { ArrowDown, ArrowUp, History, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { handleError } from "@/lib/utils"
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
        const result = await response.json();
        if (result.success) {
          setBanks(result.data.banks || []);
          setOperators(result.data.operators || []);
        }
      }
    } catch (error) {
      console.error('Error fetching banks and operators:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/user/wallet-data');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
        setBalance(data.balance);
          setTransactions(data.transactions || []);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

   useEffect(() => {
    setIsClient(true);
    setBalance(user?.balance ?? null);
    setTransactions(initialTransactions);
    
    // Fetch banks and operators when component mounts
    fetchBanksAndOperators();
  }, [user, initialTransactions]);

  const onTransaction = async (type: 'Deposit' | 'Withdrawal') => {
    if (balance === null) return;
    
    const amount = type === 'Deposit' ? parseFloat(depositAmount) : parseFloat(withdrawalForm.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({ 
        variant: "destructive", 
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0"
      });
      return;
    }
    
    if (type === 'Withdrawal' && amount > balance) {
        toast({ 
          variant: "destructive", 
          title: "Insufficient Funds",
          description: "You don't have enough money in your wallet for this withdrawal. Please add funds first."
        });
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
          description: "Please fill in all required fields including amount, bank details, and account information.",
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
          // Check if user is authenticated before proceeding with withdrawal
          const sessionResponse = await fetch('/api/test-session');
          if (!sessionResponse.ok) {
            const userFriendlyMessage = handleError('Please log in again to continue with withdrawal');
            toast({
              title: "Authentication Error",
              description: userFriendlyMessage,
              variant: "destructive"
            });
            return;
          }

          const response = await fetch('/api/wallet/withdraw', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(withdrawalForm),
          });

          const result = await response.json();

          if (!response.ok) {
            const userFriendlyMessage = handleError(result.error || "Failed to process withdrawal");
            toast({
              title: "Withdrawal Failed",
              description: userFriendlyMessage,
              variant: "destructive"
            });
            return;
          }

          // PayChangu transfer was successful
                     toast({
             title: "Withdrawal Initiated Successfully! 🎉",
             description: `Withdrawal of MK ${result.amount.toLocaleString()} has been initiated. Transfer ID: ${result.transfer_id}. Fee: MK ${result.fee.toLocaleString()}`,
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
          const userFriendlyMessage = handleError(error as Error);
          toast({
            title: "Withdrawal Error",
            description: userFriendlyMessage,
            variant: "destructive"
          });
        }
      });
    }
  }

  // Don't render until client-side to prevent hydration mismatches
  if (!isClient) {
    return (
      <div className="grid gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl md:text-3xl">My Wallet</CardTitle>
            <CardDescription>
              Loading...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 md:h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl md:text-3xl">My Wallet</CardTitle>
          <CardDescription>
            Manage your funds and transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="p-4 md:p-6 rounded-lg bg-primary text-primary-foreground">
            <h3 className="text-base md:text-lg opacity-80">Current Balance</h3>
            {balance === null ? (
              <Skeleton className="h-8 md:h-12 w-1/2 mt-2" />
            ) : (
              <p className="text-3xl md:text-5xl font-bold font-headline">
               MK {balance.toLocaleString()}
             </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full font-bold py-6 md:py-8 text-base md:text-lg"
                >
                  <ArrowUp className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl" style={{ zIndex: 10000 }}>
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you wish to deposit. A 2.5% deposit fee will be applied. You will be redirected to Pay Changu to complete the payment.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deposit-amount">
                      Amount
                    </Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
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
                <Button size="lg" variant="secondary" className="w-full font-bold py-6 md:py-8 text-base md:text-lg">
                  <ArrowDown className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount and bank details for withdrawal. A 2.5% withdrawal fee will be applied. Funds will be sent via PayChangu transfer.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="withdraw-amount">
                      Amount
                    </Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount (MWK)"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="bank-uuid">
                      Bank/Operator
                    </Label>
                    <Select 
                      value={withdrawalForm.bank_uuid} 
                      onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, bank_uuid: value }))}
                      disabled={loadingBanks}
                    >
                      <SelectTrigger>
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
                            <SelectItem value="no-operators" disabled>No mobile money operators available</SelectItem>
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
                            <SelectItem value="no-banks" disabled>Bank transfers not available</SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="account-number">
                      {operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? 'Phone Number' : 'Account Number'}
                    </Label>
                    <Input
                      id="account-number"
                      type="text"
                      value={withdrawalForm.bank_account_number}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
                      placeholder={operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? "e.g., 265991234567" : "e.g., 1234567890"}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="account-name">
                      {operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? 'Registered Name' : 'Account Name'}
                    </Label>
                    <Input
                      id="account-name"
                      type="text"
                      value={withdrawalForm.bank_account_name}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bank_account_name: e.target.value }))}
                      placeholder={operators.some(op => op.ref_id === withdrawalForm.bank_uuid) ? "Name registered on mobile money" : "Full name on bank account"}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => onTransaction('Withdrawal')} type="submit" disabled={isPending || balance === null} className="w-full md:w-auto">
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
            <CardTitle className="font-headline text-xl md:text-2xl">Transaction History</CardTitle>
            <CardDescription>A record of your recent deposits and withdrawals.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="hidden md:table-cell">Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                      <TableCell className="font-mono hidden md:table-cell text-xs">{tx.id}</TableCell>
                    <TableCell>
                        <Badge variant={tx.type === 'Deposit' ? 'secondary' : 'outline'} className="capitalize text-xs">
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
                          className="capitalize text-xs"
                      >
                        {tx.status || 'pending'}
                      </Badge>
                    </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">
                      {formatTransactionDate(tx.date)}
                    </TableCell>
                      <TableCell className="text-right font-medium text-sm">MK {tx.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs hidden lg:table-cell">MK {tx.fee.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-6 md:p-8 border-2 border-dashed rounded-lg">
                <History className="mx-auto h-8 w-8 md:h-12 md:w-12" />
                <p className="mt-2 md:mt-4 text-sm md:text-base">No recent transactions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
