
"use client";

import { AdminFinalizeElection } from "@/components/admin-finalize-election";
import { DashboardChart } from "@/components/dashboard-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBets } from "@/context/bet-context";
import { Users, Vote, CircleDollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { getUsers as dbGetUsers } from "@/lib/data";
import type { User } from "@/lib/data";


export default function AdminDashboardPage() {
  const { totalPot, bets, candidates } = useBets();
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    // We can fetch non-critical, supplementary data on the client if needed
    const fetchUserCount = async () => {
      const allUsers = await dbGetUsers();
      setUserCount(allUsers.length);
    };
    fetchUserCount();
  }, []);

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
            <CardTitle className="text-sm font-medium">
              Total Prize Pool
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPot.toLocaleString()} MWK</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets Placed</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalBetsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
             <p className="text-xs text-muted-foreground">
              +24 since last hour
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <DashboardChart />
      </div>

      <AdminFinalizeElection />
    </div>
  );
}
