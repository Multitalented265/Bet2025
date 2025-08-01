
import { getTransactions, getUsers } from '@/lib/data';
import { AdminRevenueClient } from '@/components/admin-revenue-client';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function RevenuePage() {
  const [transactions, users] = await Promise.all([
    getTransactions(),
    getUsers()
  ]);

  return <AdminRevenueClient initialTransactions={transactions} users={users} />;
}
