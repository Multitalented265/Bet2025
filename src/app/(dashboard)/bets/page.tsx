
"use client"

import { useState } from "react";
import { BetTicket, type Bet } from "@/components/bet-ticket";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";


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

const candidates = ["Lazarus Chakwera", "Peter Mutharika", "Saulos Chilima"];

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>(initialBets);
  const [winner, setWinner] = useState<string | null>(null);

  const handleDeclareWinner = (candidateName: string) => {
    setWinner(candidateName);

    const totalLosingPool = bets
      .filter(bet => bet.candidateName !== candidateName)
      .reduce((sum, bet) => sum + bet.amount, 0);

    const totalWinningBetsAmount = bets
      .filter(bet => bet.candidateName === candidateName)
      .reduce((sum, bet) => sum + bet.amount, 0);
      
    // Payout per unit of currency bet (e.g., per 1 MWK)
    const payoutMultiplier = totalWinningBetsAmount > 0 
      ? (totalLosingPool + totalWinningBetsAmount) / totalWinningBetsAmount 
      : 0;

    const updatedBets = bets.map(bet => {
      if (bet.candidateName === candidateName) {
        return {
          ...bet,
          status: 'Won' as const,
          winnings: Math.floor(bet.amount * payoutMultiplier),
        };
      } else {
        return {
          ...bet,
          status: 'Lost' as const,
          winnings: 0,
        };
      }
    });

    setBets(updatedBets);
  };
  
  const resetElection = () => {
    setWinner(null);
    setBets(initialBets.map(b => ({...b, status: 'Pending', winnings: undefined})));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Bets</h1>
          <p className="text-muted-foreground">
            An overview of your betting history.
          </p>
        </div>
        
        {winner ? (
            <Card className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">Winner: <span className="font-bold">{winner}</span></p>
                    <Button onClick={resetElection} size="sm" variant="outline">Reset Election</Button>
                </CardContent>
            </Card>
        ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><Award className="mr-2"/>Declare Winner</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select a Candidate</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {candidates.map(c => (
                  <DropdownMenuItem key={c} onClick={() => handleDeclareWinner(c)}>
                    {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
        )}
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
