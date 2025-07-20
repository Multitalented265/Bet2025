
"use client"

import { BetTicket } from "@/components/bet-ticket";
import { useBets } from "@/context/bet-context";

export default function BetsPage() {
  const { bets } = useBets();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline whitespace-nowrap">My Bets</h1>
        <p className="text-muted-foreground">
          An overview of your betting history.
        </p>
      </div>

      {bets.length === 0 ? (
         <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>You haven't placed any bets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bets.map((bet) => (
            <BetTicket key={bet.id} bet={bet} />
          ))}
        </div>
      )}
    </div>
  );
}
