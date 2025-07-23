
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Bet } from "@/components/bet-ticket";
import { getCandidates, getBets } from "@/lib/data";
import type { CandidateData } from "@/lib/data";

type CurrentUser = {
  id: string;
  name: string;
}

type BetContextType = {
  bets: Bet[];
  addBet: (newBet: Omit<Bet, 'id' | 'placedDate' | 'status' | 'userId'>) => void;
  finalizeElection: (winnerCandidateName: string) => void;
  electionFinalized: boolean;
  electionWinner: string | null;
  candidates: CandidateData[];
  totalPot: number;
  currentUser: CurrentUser | null;
  bettingStopped: boolean;
  stopBetting: () => void;
};

const BetContext = createContext<BetContextType | undefined>(undefined);

export function BetProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [bets, setBets] = useState<Bet[]>([]);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [totalPot, setTotalPot] = useState(0);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [electionFinalized, setElectionFinalized] = useState(false);
  const [electionWinner, setElectionWinner] = useState<string | null>(null);
  const [bettingStopped, setBettingStopped] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setCurrentUser({ id: session.user.id, name: session.user.name || 'User' });
    } else {
      setCurrentUser(null);
    }
  }, [session]);

  const fetchData = useCallback(async () => {
      const [initialCandidates, initialBets] = await Promise.all([
        getCandidates(),
        getBets(),
      ]);
      setCandidates(initialCandidates);
      setBets(initialBets);
      const newTotalPot = initialCandidates.reduce((acc, curr) => acc + curr.totalBets, 0)
      setTotalPot(newTotalPot);
    }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const addBetAction = async (newBet: Omit<Bet, 'id' | 'placedDate' | 'status' | 'userId'>) => {
    if (electionFinalized || bettingStopped) return;
    const candidate = candidates.find(c => c.name === newBet.candidateName);
    if (candidate?.status === 'Withdrawn') {
        console.error("Cannot place bet on a withdrawn candidate.");
        return;
    }
    // After a bet is placed via a server action, re-fetch all data to ensure UI consistency
    await fetchData();
  };


  const finalizeElection = (winnerCandidateName: string) => {
    setBets(prevBets =>
      prevBets.map(bet => {
        if (bet.status !== 'Pending') return bet; // Already settled
        
        return {
          ...bet,
          status: bet.candidateName === winnerCandidateName ? 'Won' : 'Lost',
        };
      })
    );
    setElectionFinalized(true);
    setElectionWinner(winnerCandidateName);
  };
  
  const stopBetting = () => {
    setBettingStopped(true);
  }

  return (
    <BetContext.Provider value={{ 
        bets, 
        addBet: addBetAction, 
        finalizeElection, 
        electionFinalized, 
        electionWinner, 
        candidates,
        totalPot, 
        currentUser,
        bettingStopped,
        stopBetting,
    }}>
      {children}
    </BetContext.Provider>
  );
}

export function useBets() {
  const context = useContext(BetContext);
  if (context === undefined) {
    throw new Error('useBets must be used within a BetProvider');
  }
  return context;
}
