
import { getCandidates } from "@/lib/data";
import { AdminCandidatesClient } from "@/components/admin-candidates-client";

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

// This is the main Server Component for the page.
// It is `async` and fetches the initial data.
export default async function AdminCandidatesPage() {
  const candidates = await getCandidates();
  
  // It then renders the Client Component, passing the data as props.
  return <AdminCandidatesClient initialCandidates={candidates} />;
}
