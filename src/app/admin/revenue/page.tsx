
import { getTransactions, getUsers } from '@/lib/data';
import { AdminRevenueClient } from '@/components/admin-revenue-client';


export default async function RevenuePage() {
  const [transactions, users] = await Promise.all([
    getTransactions(),
    getUsers()
  ]);

  return <AdminRevenueClient initialTransactions={transactions} users={users} />;
}
