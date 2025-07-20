"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Bet } from "@/components/bet-ticket";

type NewBet = Omit<Bet, 'id' | 'placedDate' | 'status'>;

type BetContextType = {
  bets: Bet[];
  addBet: (newBet: NewBet) => void;
};

const BetContext = createContext<BetContextType | undefined>(undefined);

const initialBets: Bet[] = [
    {
      id: 'BET-001',
      candidateName: 'Lazarus Chakwera',
      amount: 5000,
      placedDate: '2024-07-20',
      status: 'Pending',
    },
    {
      id: 'BET-002',
      candidateName: 'Peter Mutharika',
      amount: 10000,
      placedDate: '2024-07-18',
      status: 'Pending',
    },
    {
      id: 'BET-003',
      candidateName: 'Dalitso Kabambe',
      amount: 2500,
      placedDate: '2024-07-15',
      status: 'Pending',
    },
      {
      id: 'BET-004',
      candidateName: 'Lazarus Chakwera',
      amount: 2000,
      placedDate: '2024-07-21',
      status: 'Pending',
    },
];


export function BetProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<Bet[]>(initialBets);

  const addBet = (newBet: NewBet) => {
    const betWithDetails: Bet = {
      ...newBet,
      id: `BET-${String(bets.length + 1).padStart(3, '0')}`,
      placedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setBets(prevBets => [betWithDetails, ...prevBets]);
  };

  return (
    <BetContext.Provider value={{ bets, addBet }}>
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
