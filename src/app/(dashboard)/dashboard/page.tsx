
"use client";

import { BettingCard } from "@/components/betting-card"
import { DashboardChart } from "@/components/dashboard-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, PartyPopper } from "lucide-react";
import { useBets } from "@/context/bet-context";

export default function Dashboard() {
  const { candidates, electionFinalized, electionWinner } = useBets();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Home</h1>
        <p className="text-muted-foreground">An overview of the betting landscape.</p>
      </div>

       {electionFinalized && electionWinner && (
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center gap-4">
            <PartyPopper className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-headline">The Winner has been Declared!</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Congratulations to everyone who bet on {electionWinner}.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <div>
        <DashboardChart />
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
                <li>• <span className="font-medium">Total Prize Pool:</span> <strong className="text-primary">10,000,000 MWK</strong></li>
                <li>• <span className="font-medium">Total Bets on Winning Candidate:</span> <strong className="text-foreground">2,000,000 MWK</strong></li>
                <li>• <span className="font-medium">Your Bet on that Candidate:</span> <strong className="text-foreground">100,000 MWK</strong></li>
            </ul>
            <div className="mt-3 text-sm">
                <p>First, we calculate your percentage share of the winning candidate's bet pool:</p>
                <p className="my-2 p-2 bg-muted rounded-md text-center font-mono text-foreground">(100,000 MWK / 2,000,000 MWK) = 5%</p>
                <p>You get 5% of the total prize pool. Your payout would be:</p>
                <p className="my-2 p-3 bg-primary text-primary-foreground rounded-md text-center font-mono font-bold text-lg">5% of 10,000,000 MWK = 500,000 MWK</p>
            </div>
           </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold font-headline">Place Your Bet</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {candidates.map((candidate) => (
            <BettingCard
              key={candidate.id}
              candidate={candidate}
              disabled={electionFinalized}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
