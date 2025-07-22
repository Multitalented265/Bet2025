
"use client";

import { useBets } from "@/context/bet-context";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { Label } from "./ui/label";
import { PartyPopper } from "lucide-react";


export function AdminFinalizeElection() {
  const { candidates, finalizeElection, electionFinalized, electionWinner } = useBets();
  const { toast } = useToast();
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  const handleFinalize = () => {
    if (!selectedWinner) {
      toast({
        variant: "destructive",
        title: "No winner selected",
        description: "Please select a winner before finalizing.",
      });
      return;
    }
    finalizeElection(selectedWinner);
    toast({
      title: "Election Finalized!",
      description: `${selectedWinner} has been declared the winner.`,
    });
  };

  if (electionFinalized && electionWinner) {
     return (
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center gap-4">
            <PartyPopper className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-headline">The Winner has been Declared!</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                {electionWinner} is the official winner of the election.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalize Election</CardTitle>
        <CardDescription>
          Manually select the winner and conclude the betting. This action is irreversible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <Label htmlFor="winner-select">Select Winner</Label>
             <Select onValueChange={setSelectedWinner} disabled={electionFinalized}>
                <SelectTrigger id="winner-select" className="w-[280px]">
                    <SelectValue placeholder="Select a candidate" />
                </SelectTrigger>
                <SelectContent>
                    {candidates.map(c => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={!selectedWinner || electionFinalized}>
                Finalize Election
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will finalize the election, declaring <span className="font-bold">{selectedWinner}</span> as the winner. All bets will be settled accordingly. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinalize}>
                Yes, Finalize Election
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
