
import { BettingCard } from "@/components/betting-card"
import { DashboardChart } from "@/components/dashboard-chart"
import { handleBetPlacement } from "@/actions/bet"

const candidates = [
  { id: 1, name: "Lazarus Chakwera", image: "https://times.mw/wp-content/uploads/2023/07/lazarus-chakwera-2-860x1014.jpg", hint: "malawian man politician", totalBets: 75000 },
  { id: 2, name: "Peter Mutharika", image: "https://www.sadc.int/sites/default/files/2022-02/Peter-Mutharika.jpg", hint: "malawian man suit", totalBets: 62000 },
  { id: 3, name: "Saulos Chilima", image: "https://placehold.co/202x202.png", hint: "malawian man glasses", totalBets: 48000 },
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
        <DashboardChart initialData={candidates} />
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-4 font-headline">Place Your Bet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
