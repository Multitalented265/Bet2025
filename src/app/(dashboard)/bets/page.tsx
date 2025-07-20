
"use client"

import { useState } from "react";
import { BetTicket, type Bet } from "@/components/bet-ticket";
import { Button } from "@/components/ui/button";

const initialBets: Bet[] = [
  {
    id: 'BET-001',
    candidateName: 'Lazarus Chakwera',
    amount: 5000,
    placedDate: '2024-07-20',
    status: 'Pending',
  },
  {
    id: 'BET-002',
    candidateName: 'Peter Mutharika',
    amount: 10000,
    placedDate: '2024-07-18',
    status: 'Pending',
  },
  {
    id: 'BET-003',
    candidateName: 'Saulos Chilima',
    amount: 2500,
    placedDate: '2024-07-15',
    status: 'Pending',
  },
    {
    id: 'BET-004',
    candidateName: 'Lazarus Chakwera',
    amount: 2000,
    placedDate: '2024-07-21',
    status: 'Pending',
  },
];

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>(initialBets);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold font-headline whitespace-nowrap">My Bets</h1>
          <p className="text-muted-foreground">
            An overview of your betting history.
          </p>
        </div>
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
