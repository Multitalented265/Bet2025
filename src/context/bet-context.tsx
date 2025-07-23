
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { Bet } from "@/components/bet-ticket";
import { getCandidates, getBets, getCurrentUser as dbGetCurrentUser } from "@/lib/data";
import type { CandidateData, User as FullUserType } from "@/lib/data";


export type User = Omit<FullUserType, 'totalBets' | 'bets' | 'status' | 'joined' | 'email' | 'password' | 'emailVerified' | 'image' | 'joinedAt' | 'balance' | 'notifyOnBetStatusUpdates' >;

type BetContextType = {
  bets: Bet[];
  addBet: (newBet: Omit<Bet, 'id' | 'placedDate' | 'status' | 'userId'>) => void;
  finalizeElection: (winnerCandidateName: string) => void;
  electionFinalized: boolean;
  electionWinner: string | null;
  candidates: CandidateData[];
  totalPot: number;
  currentUser: User | null;
  bettingStopped: boolean;
  stopBetting: () => void;
};

const BetContext = createContext<BetContextType | undefined>(undefined);

export function BetProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [totalPot, setTotalPot] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [electionFinalized, setElectionFinalized] = useState(false);
  const [electionWinner, setElectionWinner] = useState<string | null>(null);
  const [bettingStopped, setBettingStopped] = useState(false);

  const fetchData = useCallback(async () => {
      const [initialCandidates, initialBets, user] = await Promise.all([
        getCandidates(),
        getBets(),
        dbGetCurrentUser().catch(() => null),
      ]);
      setCandidates(initialCandidates);
      setBets(initialBets);
      setTotalPot(initialCandidates.reduce((acc, curr) => acc + curr.totalBets, 0));
       if (user) {
        setCurrentUser({ id: user.id, name: user.name });
      }
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
    
    // We don't need to call placeBet here anymore because the server action handleBetPlacement already does it.
    // This function's main job now is to re-fetch data to update the UI.
    
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
