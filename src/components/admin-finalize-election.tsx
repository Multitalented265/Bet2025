
"use client";

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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useTransition } from "react";
import { Label } from "./ui/label";
import { PartyPopper, Ban, Play } from "lucide-react";
import type { CandidateData } from "@/lib/data";
import { stopAllBetting, enableBetting, finalizeElectionAction } from "@/actions/admin";

type FinalizeElectionProps = {
  candidates: CandidateData[];
  bettingEnabled: boolean;
}

// These would come from a global state or API in a real app.
// For now, we manage them as simple mock state.
const electionFinalized = false;
const electionWinner = null;

export function AdminFinalizeElection({ candidates, bettingEnabled }: FinalizeElectionProps) {
  const { toast } = useToast();
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFinalize = () => {
    if (!selectedWinner) {
      toast({
        variant: "destructive",
        title: "No winner selected",
        description: "Please select a winner before finalizing.",
      });
      return;
    }
    
    startTransition(async () => {
      try {
        const result = await finalizeElectionAction(selectedWinner);
        toast({
          title: "Election Finalized!",
          description: `${selectedWinner} has been declared the winner. ${result.winningBetsCount} winning bets processed.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Finalization Failed",
          description: error.message || "Failed to finalize election. Please try again.",
        });
      }
    });
  };
  
  const handleStopBetting = () => {
    startTransition(async () => {
      try {
        await stopAllBetting();
        toast({
          title: "Betting Stopped",
          description: "All betting has been disabled for users.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to stop betting. Please try again.",
        });
      }
    });
  };

  const handleEnableBetting = () => {
    startTransition(async () => {
      try {
        await enableBetting();
        toast({
          title: "Betting Enabled",
          description: "All betting has been enabled for users.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to enable betting. Please try again.",
        });
      }
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
        <CardTitle>Election & Betting Controls</CardTitle>
        <CardDescription>
          Manage the election status. These actions are irreversible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg border bg-muted flex items-center justify-between">
            <div className="flex items-center gap-3">
                 {!bettingEnabled ? <Ban className="h-6 w-6 text-destructive"/> : <Play className="h-6 w-6 text-green-500" />}
                <div>
                    <h4 className="font-semibold">Betting Status</h4>
                    <p className="text-sm text-muted-foreground">
                        {!bettingEnabled ? "Betting has been STOPPED." : "Betting is currently LIVE."}
                    </p>
                </div>
            </div>
            {bettingEnabled ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={isPending}>
                        {isPending ? "Stopping..." : "Stop All Betting"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will immediately disable all betting for users. They will not be able to place any new bets. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStopBetting}>
                        Yes, Stop Betting
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={isPending}>
                        {isPending ? "Enabling..." : "Enable Betting"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Enable Betting?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will re-enable all betting for users. They will be able to place new bets again.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEnableBetting}>
                        Yes, Enable Betting
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            )}
        </div>

        
        <div className="space-y-4">
            <Label htmlFor="winner-select">1. Select Winner to Finalize</Label>
             <Select onValueChange={setSelectedWinner} disabled={electionFinalized || bettingEnabled}>
                <SelectTrigger id="winner-select" className="w-[280px]">
                    <SelectValue placeholder="Select a candidate" />
                </SelectTrigger>
                <SelectContent>
                    {candidates.filter(c => c.status === 'Active').map(c => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!selectedWinner || electionFinalized || bettingEnabled}>
                    2. Finalize Election & Settle Bets
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
        </div>
      </CardContent>
    </Card>
  );
}
