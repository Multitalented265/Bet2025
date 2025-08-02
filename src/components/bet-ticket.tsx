
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type Bet = {
  id: string;
  userId: string;
  candidateName: string;
  amount: number;
  placedDate: Date | string;
  status: string;
};

type BetTicketProps = {
  bet: Bet;
  totalBetsOnCandidate: number;
  totalPot: number;
};

const statusConfig: Record<string, { color: string; label: string }> = {
  Active: {
    color: "bg-yellow-500 text-white",
    label: "Active",
  },
  Pending: {
    color: "bg-blue-500 text-white",
    label: "Pending",
  },
  Completed: {
    color: "bg-green-500 text-white",
    label: "Completed",
  },
};

export function BetTicket({ bet, totalBetsOnCandidate, totalPot }: BetTicketProps) {
  // Format date from Date object or string
  const formatDate = (date: Date | string) => {
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = date;
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const placedDate = formatDate(bet.placedDate);

  const { color, label } = statusConfig[bet.status] || {
    color: "bg-gray-500 text-white",
    label: bet.status,
  };

  const calculateWinnings = () => {
    if (totalBetsOnCandidate === 0) {
      return bet.amount; // Return bet amount as minimum win
    }
    const userShare = bet.amount / totalBetsOnCandidate;
    const winnings = userShare * totalPot;
    return Math.max(winnings, bet.amount); // Ensure at least the bet amount is returned
  };
  
  const finalWinnings = calculateWinnings();

  // Show potential win for Active, Pending, and any other active status
  const shouldShowPotentialWin = bet.status === 'Active' || bet.status === 'Pending' || bet.status === 'active' || bet.status === 'pending';

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
         {shouldShowPotentialWin && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Potential Win</span>
            <span className="font-bold text-2xl text-accent">{finalWinnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} MWK</span>
          </div>
        )}
         {bet.status === 'Completed' && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Bet Completed</span>
            <span className="font-bold text-2xl text-green-500">{finalWinnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} MWK</span>
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
