
import { BettingGrid } from "@/components/betting-grid"
import { DashboardChart } from "@/components/dashboard-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, PartyPopper } from "lucide-react";
import { getCandidatesWithBetCounts, getUserById, getAdminSettings } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { User, CandidateData } from "@/lib/data";

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return redirect("/login");
  }

  // Fetch all data in parallel for better performance
  const [user, candidates, adminSettings] = await Promise.all([
    getUserById(session.user.id),
    getCandidatesWithBetCounts(),
    getAdminSettings()
  ]);

  console.log('📊 Dashboard candidates with bet counts:', candidates.map(c => `${c.name}: ${c.betCount} bets`));

  if (!user) {
    return redirect("/login");
  }
  
  const totalPot = candidates.reduce((acc: number, curr: CandidateData & { betCount: number }) => acc + curr.totalBets, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your bets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.balance.toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Available for betting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pot</CardTitle>
            <PartyPopper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPot.toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Total bets placed
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <DashboardChart candidates={candidates} totalPot={totalPot} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-3 bg-muted rounded-full">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">How It Works</CardTitle>
            <CardDescription>Understand the betting pool and your potential winnings.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            This platform uses a <strong className="text-foreground">pari-mutuel betting</strong> system. Instead of betting against the house, you're betting against other users. Here's how it breaks down:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Placing a Bet:</strong> All bets on all candidates are collected into a single large prize pool, which you can see in the chart above.
            </li>
            <li>
              <strong className="text-foreground">Winning:</strong> If the candidate you bet on is declared the winner of the election, you win!
            </li>
            <li>
              <strong className="text-foreground">Calculating Payouts:</strong> The total prize pool is distributed among all the people who bet on the winning candidate. Your share of the winnings is proportional to how much you bet.
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-foreground mb-2">Example Payout Calculation:</h4>
            <ul className="list-none space-y-1 text-sm">
                <li>• <span className="font-medium">Total Prize Pool:</span> <strong className="text-primary">MWK 10,000,000</strong></li>
                <li>• <span className="font-medium">Total Bets on Winning Candidate:</span> <strong className="text-foreground">MWK 2,000,000</strong></li>
                <li>• <span className="font-medium">Your Bet on that Candidate:</span> <strong className="text-foreground">MWK 100,000</strong></li>
            </ul>
            <div className="mt-3 text-sm">
                <p>First, we calculate your percentage share of the winning candidate's bet pool:</p>
                <p className="my-2 p-2 bg-muted rounded-md text-center font-mono text-foreground">(MWK 100,000 / MWK 2,000,000) = 5%</p>
                <p>You get 5% of the total prize pool. Your payout would be:</p>
                <p className="my-2 p-3 bg-primary text-primary-foreground rounded-md text-center font-mono font-bold text-lg">5% of MWK 10,000,000 = MWK 500,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <BettingGrid candidates={candidates} user={user} bettingEnabled={adminSettings.bettingEnabled} />
      </div>
    </div>
  );
}
