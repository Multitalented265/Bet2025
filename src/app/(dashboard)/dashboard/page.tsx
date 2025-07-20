import { BettingCard } from "@/components/betting-card"
import { DashboardChart } from "@/components/dashboard-chart"
import { Header } from "@/components/header"
import { handleBetPlacement } from "@/actions/bet"

const candidates = [
  { id: 1, name: "Lazarus Chakwera", image: "https://placehold.co/200x200.png", hint: "malawian man politician", totalBets: 75000 },
  { id: 2, name: "Peter Mutharika", image: "https://placehold.co/201x201.png", hint: "malawian man suit", totalBets: 62000 },
  { id: 3, name: "Saulos Chilima", image: "https://placehold.co/202x202.png", hint: "malawian man glasses", totalBets: 48000 },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <Header title="Dashboard" />
      <div>
        <DashboardChart initialData={candidates} />
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-4 font-headline">Place Your Bet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
