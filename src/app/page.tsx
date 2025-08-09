
import { BettingGrid } from "@/components/betting-grid"
import { DashboardChart } from "@/components/dashboard-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, PartyPopper, LogIn, UserPlus } from "lucide-react";
import { getCandidates } from "@/lib/data";
import { getBettingStatus } from "@/lib/betting";
import type { CandidateData } from "@/lib/data";
import Link from "next/link";
import Logo from "@/components/logo"

export default async function HomePage() {
  try {
    // Fetch data for the home page (no user authentication required)
    const [candidates, bettingEnabled] = await Promise.all([
      getCandidates(),
      getBettingStatus()
    ]);

    console.log('📊 Home page candidates with bet counts:', candidates.map(c => `${c.name}: ${c.betCount} bets`));
    
    const totalPot = candidates.reduce((acc: number, curr: CandidateData & { betCount: number }) => acc + curr.totalBets, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Login/Signup buttons */}
      <header className="bg-card">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Logo size="xl" />
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">Live Betting Pool</h1>
            <p className="text-muted-foreground">
              Watch the action unfold in real-time. Join the excitement and place your bets!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
                <div className="text-2xl font-bold">{candidates.filter(c => c.status === 'Active').length}</div>
                <p className="text-xs text-muted-foreground">
                  In the race
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
            <BettingGrid candidates={candidates} user={null} bettingEnabled={bettingEnabled} />
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please refresh the page if this persists.</p>
        </div>
      </div>
    );
  }
}
