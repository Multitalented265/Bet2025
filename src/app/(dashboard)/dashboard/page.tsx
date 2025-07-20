
import { BettingCard } from "@/components/betting-card"
import { DashboardChart } from "@/components/dashboard-chart"
import { handleBetPlacement } from "@/actions/bet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const candidates = [
  { id: 1, name: "Lazarus Chakwera", image: "https://times.mw/wp-content/uploads/2023/07/lazarus-chakwera-2-860x1014.jpg", hint: "malawian man politician", totalBets: 75000 },
  { id: 2, name: "Peter Mutharika", image: "https://www.peaceparks.org/wp-content/uploads/2018/08/image-51-2.jpeg", hint: "malawian man suit", totalBets: 62000 },
  { id: 3, name: "Dalitso Kabambe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCBX_R1SzYblo8R62us3MuJgBw5pIQ_w7pYboMeFzE5eHHmD31CqmrJSjMlXaiKQ0fZQ&usqp=CAU", hint: "malawian man economist", totalBets: 48000 },
  { id: 4, name: "Atupele Muluzi", image: "https://www.nyasatimes.com/wp-content/uploads/ATUPELE-MINISTER.jpg", hint: "malawian man leader", totalBets: 35000 },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Home</h1>
        <p className="text-muted-foreground">An overview of the betting landscape.</p>
      </div>
      <div>
        <DashboardChart candidates={candidates} />
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
              <strong className="text-foreground">Calculating Payouts:</strong> The total prize pool is distributed among all the people who bet on the winning candidate. Your share of the winnings is proportional to how much you bet. For example, if you placed 10% of the total bets on the winning candidate, you receive 10% of the total prize pool.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-3xl font-bold mb-4 font-headline">Place Your Bet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {candidates.map((candidate) => (
            <BettingCard
              key={candidate.id}
              candidate={candidate}
              onBet={handleBetPlacement}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
