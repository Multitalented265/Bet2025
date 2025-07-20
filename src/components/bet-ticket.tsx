"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Bet = {
  id: string;
  candidateName: string;
  amount: number;
  placedDate: string;
  status: 'Pending' | 'Won' | 'Lost';
  potentialWin: number; // This value is kept for data structure consistency but not displayed
};

type BetTicketProps = {
  bet: Bet;
};

const statusColors = {
  Pending: "bg-yellow-500 text-white",
  Won: "bg-green-500 text-white",
  Lost: "bg-destructive text-destructive-foreground",
};

export function BetTicket({ bet }: BetTicketProps) {
  // Parsing date as UTC to avoid timezone issues between server and client
  const placedDate = new Date(bet.placedDate + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-headline">{bet.candidateName}</CardTitle>
        <Badge className={cn("text-xs", statusColors[bet.status])}>
          {bet.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Bet Amount</span>
            <span className="font-bold text-2xl text-primary">{bet.amount.toLocaleString()} MWK</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto bg-muted/50 py-3 px-6 text-xs text-muted-foreground flex justify-between">
          <span>ID: {bet.id}</span>
          <span>Placed: {placedDate}</span>
      </CardFooter>
    </Card>
  );
}
