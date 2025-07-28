
import { AdminFinalizeElection } from "@/components/admin-finalize-election";
import { DashboardChart } from "@/components/dashboard-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Vote, CircleDollarSign } from "lucide-react";
import { getBets, getCandidates, getUsers, getAdminSettings, getBetStatistics } from "@/lib/data";


export default async function AdminDashboardPage() {
  const [candidates, users, bets, adminSettings, betStats] = await Promise.all([
    getCandidates(),
    getUsers(),
    getBets(),
    getAdminSettings(),
    getBetStatistics()
  ]);

  const totalPot = candidates.reduce((acc, curr) => acc + curr.totalBets, 0);
  const userCount = users.length;
  const totalBetsCount = bets.length;


  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Oversee and manage the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{betStats.totalBets}</div>
            <p className="text-xs text-muted-foreground">
              {betStats.pendingBets} pending, {betStats.wonBets} won, {betStats.lostBets} lost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pot</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{betStats.totalPrizePool.toLocaleString()} MWK</div>
            <p className="text-xs text-muted-foreground">
              Prize pool
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Betting Status</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminSettings.bettingEnabled ? "Live" : "Stopped"}</div>
            <p className="text-xs text-muted-foreground">
              {adminSettings.bettingEnabled ? "Betting enabled" : "Betting disabled"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <DashboardChart candidates={candidates} totalPot={totalPot} />
      </div>

      <AdminFinalizeElection candidates={candidates} bettingEnabled={adminSettings.bettingEnabled} />
    </div>
  );
}
