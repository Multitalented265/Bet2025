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
  potentialWin: number;
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
        <div className="flex justify-between">
            <span className="text-muted-foreground">Bet Amount</span>
            <span className="font-bold">{bet.amount.toLocaleString()} MWK</span>
        </div>
        <div className="flex justify-between">
            <span className="text-muted-foreground">Potential Win</span>
            <span className="font-bold text-primary">{bet.potentialWin.toLocaleString()} MWK</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto bg-muted/50 py-3 px-6 text-xs text-muted-foreground flex justify-between">
          <span>ID: {bet.id}</span>
          <span>Placed: {new Date(bet.placedDate).toLocaleDateString()}</span>
      </CardFooter>
    </Card>
  );
}
