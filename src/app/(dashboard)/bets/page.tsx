
import { BetTicket } from "@/components/bet-ticket";
import { getBets, getCandidates } from "@/lib/data";
import { getSession } from "@/lib/auth";


export default async function BetsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full">
         <p className="text-muted-foreground">Please log in to see your bets.</p>
      </div>
    )
  }
  
  const allBets = await getBets();
  const candidates = await getCandidates();
  
  const totalPot = candidates.reduce((acc, curr) => acc + curr.totalBets, 0);

  const userBets = allBets.filter(bet => bet.userId === session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline whitespace-nowrap">My Bets</h1>
        <p className="text-muted-foreground">
          An overview of your betting history.
        </p>
      </div>

      {userBets.length === 0 ? (
         <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>You haven't placed any bets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {userBets.map((bet) => {
            const candidate = candidates.find(c => c.name === bet.candidateName);
            const totalBetsOnCandidate = candidate ? candidate.totalBets : 0;
            return (
              <BetTicket 
                key={bet.id} 
                bet={bet}
                totalBetsOnCandidate={totalBetsOnCandidate}
                totalPot={totalPot}
              />
            )
          })}
        </div>
      )}
    </div>
  );
}
