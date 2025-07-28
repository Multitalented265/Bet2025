
import { AdminSupportClient } from '@/components/admin-support-client';
import { getSupportTickets } from '@/lib/data';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const tickets = await getSupportTickets();

  return <AdminSupportClient initialTickets={tickets} />;
}
