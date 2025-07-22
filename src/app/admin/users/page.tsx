
import { getUsers } from "@/lib/data";
import { AdminUsersClient } from "@/components/admin-users-client";
import type { User } from "@/lib/data"

// This is the main Server Component for the page.
// It is `async` and fetches the initial data.
export default async function AdminUsersPage() {
    const users = await getUsers();
    // It then renders the Client Component, passing the data as props.
    return <AdminUsersClient initialUsers={users} />
}
