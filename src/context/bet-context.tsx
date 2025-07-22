
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Bet } from "@/components/bet-ticket";
import { getCandidates, getBets, placeBet, getUsers } from "@/lib/data";
import type { CandidateData, User as FullUserType } from "@/lib/data";


export type User = Omit<FullUserType, 'totalBets' | 'bets' | 'status' | 'joined' | 'email'>;

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


  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      const [initialCandidates, initialBets, allUsers] = await Promise.all([
        getCandidates(),
        getBets(),
        getUsers(),
      ]);
      setCandidates(initialCandidates);
      setBets(initialBets);
      setTotalPot(initialCandidates.reduce((acc, curr) => acc + curr.totalBets, 0));
      if (allUsers.length > 0) {
        setCurrentUser({ id: allUsers[0].id, name: allUsers[0].name });
      }
    };
    fetchData();
  }, []);
  
  const addBetAction = async (newBet: Omit<Bet, 'id' | 'placedDate' | 'status' | 'userId'>) => {
    if (electionFinalized || bettingStopped) return;
    const candidate = candidates.find(c => c.name === newBet.candidateName);
    if (candidate?.status === 'Withdrawn') {
        console.error("Cannot place bet on a withdrawn candidate.");
        return;
    }
    
    // We don't need to call placeBet here anymore because the server action handleBetPlacement already does it.
    // This function's main job now is to re-fetch data to update the UI.
    
    const [updatedCandidates, updatedBets] = await Promise.all([getCandidates(), getBets()]);
    setCandidates(updatedCandidates);
    setBets(updatedBets);
    setTotalPot(updatedCandidates.reduce((acc, curr) => acc + curr.totalBets, 0));
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
