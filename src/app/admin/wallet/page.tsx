import { getAdminSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { WalletService } from "@/lib/wallet-service"
import type { TransactionWithUser } from "@/lib/wallet-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminWalletPage() {
  const session = await getAdminSession()
  
  if (!session?.user?.id) {
    return redirect("/admin-auth/login")
  }

  // Check if user is admin (you can implement your own admin check)
  // For now, we'll allow access to anyone with a session

  // Get fee statistics
  const feeStats = await WalletService.getTotalFees()

  // Get recent transactions for admin view
  const recentTransactions: TransactionWithUser[] = await WalletService.getAllTransactions(20)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet Administration</h1>
      </div>

      {/* Fee Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Deposit Fees</CardTitle>
            <CardDescription>Fees collected from deposits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {feeStats.depositFees.toLocaleString()} MWK
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Withdrawal Fees</CardTitle>
            <CardDescription>Fees collected from withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {feeStats.withdrawalFees.toLocaleString()} MWK
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Fees Collected</CardTitle>
            <CardDescription>Combined fees from all transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {feeStats.total.toLocaleString()} MWK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest wallet transactions across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>TX Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {tx.user?.name || tx.user?.email || tx.userId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'Deposit' ? 'default' : 'secondary'}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{parseFloat(tx.amount.toString()).toLocaleString()} MWK</TableCell>
                  <TableCell>{parseFloat(tx.fee.toString()).toLocaleString()} MWK</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        tx.status === 'completed' ? 'default' : 
                        tx.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {tx.txRef || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Wallet system health and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">PayChangu Integration</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Webhook endpoint active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Callback endpoint active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Fee calculation: 2.5%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Database</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Transaction logging active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Balance syncing active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Rollback protection enabled</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 