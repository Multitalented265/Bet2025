
"use client"

import { BetTicket } from "@/components/bet-ticket";
import { useBets } from "@/context/bet-context";

export default function BetsPage() {
  const { bets, candidates, totalPot, currentUser } = useBets();

  if (!currentUser) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full">
         <p className="text-muted-foreground">Loading user data...</p>
      </div>
    )
  }

  const userBets = bets.filter(bet => bet.userId === currentUser.id);

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
            return (
              <BetTicket 
                key={bet.id} 
                bet={bet}
                totalBetsOnCandidate={candidate?.totalBets || 0}
                totalPot={totalPot}
              />
            )
          })}
        </div>
      )}
    </div>
  );
}
