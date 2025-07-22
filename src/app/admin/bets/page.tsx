
import { AdminBetsClient } from "@/components/admin-bets-client";
import { getBets, getUsers } from "@/lib/data";

export default async function AdminBetsPage() {
    const bets = await getBets();
    const users = await getUsers();

    const betsWithUserName = bets.map(bet => {
        const user = users.find(u => u.id === bet.userId);
        return {
            ...bet,
            userName: user ? user.name : 'Unknown User',
        }
    })

    return <AdminBetsClient initialBets={betsWithUserName} />;
}
