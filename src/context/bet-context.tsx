
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Bet } from "@/components/bet-ticket";
import type { CandidateData } from "@/components/dashboard-chart";

type NewBet = Omit<Bet, 'id' | 'placedDate' | 'status'>;

type BetContextType = {
  bets: Bet[];
  addBet: (newBet: NewBet) => void;
  finalizeElection: (winnerCandidateName: string) => void;
  electionFinalized: boolean;
  electionWinner: string | null;
  candidates: CandidateData[];
  totalPot: number;
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

const initialCandidates: CandidateData[] = [
  { id: 1, name: "Lazarus Chakwera", image: "https://times.mw/wp-content/uploads/2023/07/lazarus-chakwera-2-860x1014.jpg", hint: "malawian man politician", totalBets: 75000 },
  { id: 2, name: "Peter Mutharika", image: "https://www.peaceparks.org/wp-content/uploads/2018/08/image-51-2.jpeg", hint: "malawian man suit", totalBets: 62000 },
  { id: 3, name: "Dalitso Kabambe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCBX_R1SzYblo8R62us3MuJgBw5pIQ_w7pYboMeFzE5eHHmD31CqmrJSjMlXaiKQ0fZQ&usqp=CAU", hint: "malawian man economist", totalBets: 48000 },
  { id: 4, name: "Atupele Muluzi", image: "https://www.nyasatimes.com/wp-content/uploads/ATUPELE-MINISTER.jpg", hint: "malawian man leader", totalBets: 35000 },
]


export function BetProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<Bet[]>(initialBets);
  const [electionFinalized, setElectionFinalized] = useState(false);
  const [electionWinner, setElectionWinner] = useState<string | null>(null);
  
  const [candidates, setCandidates] = useState<CandidateData[]>(initialCandidates);
  const [totalPot, setTotalPot] = useState(initialCandidates.reduce((acc, curr) => acc + curr.totalBets, 0));

  useEffect(() => {
    if (electionFinalized) return;
    
    const interval = setInterval(() => {
      setCandidates((prevData) => {
        const newChartData = [...prevData];
        let betAmount = 0;

        // With a 40% chance, give a large boost to a candidate who is not in the lead
        if (Math.random() < 0.4 && newChartData.length > 1) {
           const sortedByBets = [...newChartData].sort((a, b) => b.totalBets - a.totalBets);
           const challengers = sortedByBets.slice(1);
          
          if (challengers.length > 0) {
            const challengerIndex = Math.floor(Math.random() * challengers.length);
            const challengerName = challengers[challengerIndex].name;
            const originalIndex = newChartData.findIndex(c => c.name === challengerName);
            
            if (originalIndex !== -1) {
              betAmount = Math.floor(Math.random() * 20 + 10) * 100; // 1000 to 3000 MWK
              newChartData[originalIndex].totalBets += betAmount;
            }
          }
        } else {
          // Otherwise, add a smaller random bet to any candidate
          const randomIndex = Math.floor(Math.random() * newChartData.length);
          betAmount = Math.floor(Math.random() * 5 + 1) * 100; // 100 to 500 MWK
          newChartData[randomIndex].totalBets += betAmount;
        }

        setTotalPot(pot => pot + betAmount);
        return newChartData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [electionFinalized]);

  const addBet = (newBet: NewBet) => {
    const betWithDetails: Bet = {
      ...newBet,
      id: `BET-${String(bets.length + 1).padStart(3, '0')}`,
      placedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setBets(prevBets => [betWithDetails, ...prevBets]);

    // Update candidate and total pot
    setCandidates(prevCandidates => 
      prevCandidates.map(c => 
        c.name === newBet.candidateName 
          ? { ...c, totalBets: c.totalBets + newBet.amount }
          : c
      )
    )
    setTotalPot(pot => pot + newBet.amount);
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

  return (
    <BetContext.Provider value={{ bets, addBet, finalizeElection, electionFinalized, electionWinner, candidates, totalPot }}>
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
