
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
  winnings?: number;
};

type BetTicketProps = {
  bet: Bet;
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

export function BetTicket({ bet }: BetTicketProps) {
  // Parsing date as UTC to avoid timezone issues between server and client
  const placedDate = new Date(bet.placedDate + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const { color, label } = statusConfig[bet.status];

  return (
    <Card className={cn(
      "flex flex-col shadow-md hover:shadow-lg transition-all duration-300",
       bet.status === 'Won' && 'border-green-500 border-2',
       bet.status === 'Lost' && 'opacity-70'
      )}>
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
        {bet.status === 'Won' && bet.winnings !== undefined && (
          <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/50 p-3 rounded-md">
            <span className="text-green-800 dark:text-green-200 font-semibold">Total Payout</span>
            <span className="font-bold text-2xl text-green-600 dark:text-green-400">{bet.winnings.toLocaleString()} MWK</span>
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
