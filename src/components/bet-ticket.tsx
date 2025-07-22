
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type Bet = {
  id: string;
  candidateName: string;
  amount: number;
  placedDate: string;
  status: 'Pending' | 'Won' | 'Lost';
};

type BetTicketProps = {
  bet: Bet;
  totalBetsOnCandidate: number;
  totalPot: number;
};

const statusConfig = {
  Pending: {
    color: "bg-yellow-500 text-white",
    label: "Pending",
  },
  Won: {
    color: "bg-green-500 text-white",
    label: "Won",
  },
  Lost: {
    color: "bg-destructive text-destructive-foreground",
    label: "Lost",
  },
};

export function BetTicket({ bet, totalBetsOnCandidate, totalPot }: BetTicketProps) {
  // Parsing date as UTC to avoid timezone issues between server and client
  const placedDate = new Date(bet.placedDate + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const { color, label } = statusConfig[bet.status];

  const calculatePotentialWin = () => {
    if (bet.status !== 'Pending' || totalBetsOnCandidate === 0) {
      return 0;
    }
    const userShare = bet.amount / totalBetsOnCandidate;
    return userShare * totalPot;
  };
  
  const potentialWin = calculatePotentialWin();

  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-headline">{bet.candidateName}</CardTitle>
        <Badge className={cn("text-xs", color)}>
          {label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Bet Amount</span>
            <span className="font-bold text-2xl text-primary">{bet.amount.toLocaleString()} MWK</span>
        </div>
         {bet.status === 'Pending' && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Potential Win</span>
            <span className="font-bold text-2xl text-accent">{potentialWin.toLocaleString(undefined, { maximumFractionDigits: 0 })} MWK</span>
          </div>
        )}
         {bet.status === 'Won' && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Winnings</span>
            <span className="font-bold text-2xl text-green-500">{potentialWin.toLocaleString(undefined, { maximumFractionDigits: 0 })} MWK</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto bg-muted/50 py-3 px-6 text-xs text-muted-foreground flex justify-between">
          <span>ID: {bet.id}</span>
          <span>Placed: {placedDate}</span>
      </CardFooter>
    </Card>
  );
}
