
import { getUsersWithBetDetails } from "@/lib/data";
import { AdminUsersClient } from "@/components/admin-users-client";

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

// This is the main Server Component for the page.
// It is `async` and fetches the initial data.
export default async function AdminUsersPage() {
    const users = await getUsersWithBetDetails();
    // It then renders the Client Component, passing the data as props.
    return <AdminUsersClient initialUsers={users} />
}
