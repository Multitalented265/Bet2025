
"use client"

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, DollarSign, Search } from 'lucide-react';
import { Transaction, User } from '@/lib/data';
import { Input } from '@/components/ui/input';

type RevenueClientProps = {
    initialTransactions: Transaction[];
    users: User[];
}

export function AdminRevenueClient({ initialTransactions, users }: RevenueClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const transactionsWithUserName = useMemo(() => {
    return initialTransactions.map(tx => {
      const user = users.find(u => u.id === tx.userId);
      return {
        ...tx,
        userName: user ? (user.name || 'Unknown User') : 'Unknown User'
      }
    });
  }, [initialTransactions, users]);


  const filteredTransactions = useMemo(() => {
    return transactionsWithUserName.filter(tx => {
      const searchMatch = searchQuery === '' ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.userName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return searchMatch;
    });
  }, [searchQuery, transactionsWithUserName]);

  const revenueStats = useMemo(() => {
    const totalDeposits = initialTransactions
      .filter((t) => t.type === 'Deposit')
      .reduce((acc, t) => acc + t.amount, 0);
    const depositFees = initialTransactions
      .filter((t) => t.type === 'Deposit')
      .reduce((acc, t) => acc + t.fee, 0);

    const totalWithdrawals = initialTransactions
      .filter((t) => t.type === 'Withdrawal')
      .reduce((acc, t) => acc + t.amount, 0);
    const withdrawalFees = initialTransactions
      .filter((t) => t.type === 'Withdrawal')
      .reduce((acc, t) => acc + t.fee, 0);

    const totalRevenue = depositFees + withdrawalFees;

    return {
      totalDeposits,
      depositFees,
      totalWithdrawals,
      withdrawalFees,
      totalRevenue,
    };
  }, [initialTransactions]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Revenue & Transactions</h1>
        <p className="text-muted-foreground">
          Track earnings and verify all platform transactions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue from Deposits</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.depositFees.toLocaleString()} MWK</div>
            <p className="text-xs text-muted-foreground">
              from {revenueStats.totalDeposits.toLocaleString()} MWK in total deposits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue from Withdrawals</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.withdrawalFees.toLocaleString()} MWK</div>
            <p className="text-xs text-muted-foreground">
              from {revenueStats.totalWithdrawals.toLocaleString()} MWK in total withdrawals
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.totalRevenue.toLocaleString()} MWK</div>
            <p className="text-xs text-primary-foreground/80">
              Combined from all transactions
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A log of all deposits and withdrawals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
              <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search by Transaction ID or User Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-full"
                  />
              </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Fee Collected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono">{tx.id}</TableCell>
                  <TableCell>{tx.userName}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'Deposit' ? 'secondary' : 'outline'} className="capitalize">
                      {tx.type === 'Deposit' 
                        ? <ArrowUp className="mr-1 h-3 w-3 text-green-500" /> 
                        : <ArrowDown className="mr-1 h-3 w-3 text-red-500" />}
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString()}</TableCell>
                  <TableCell className="text-right">{tx.amount.toLocaleString()} MWK</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">{tx.fee.toLocaleString()} MWK</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
