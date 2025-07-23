
import { AdminSupportClient } from '@/components/admin-support-client';
import { getSupportTickets } from '@/lib/data';


export default async function AdminSupportPage() {
  const tickets = await getSupportTickets();

  return <AdminSupportClient initialTickets={tickets} />;
}
