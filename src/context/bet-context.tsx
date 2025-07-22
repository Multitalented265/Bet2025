
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Bet } from "@/components/bet-ticket";

export type CandidateData = {
  id: number;
  name: string;
  image: string;
  hint: string;
  totalBets: number;
  status: 'Active' | 'Withdrawn';
};

type NewBet = Omit<Bet, 'id' | 'placedDate' | 'status' | 'userId'>;

type User = {
    id: string;
    name: string;
}

type BetContextType = {
  bets: Bet[];
  addBet: (newBet: NewBet) => void;
  finalizeElection: (winnerCandidateName: string) => void;
  electionFinalized: boolean;
  electionWinner: string | null;
  candidates: CandidateData[];
  addCandidate: (candidate: Omit<CandidateData, 'id' | 'totalBets' | 'status'>) => void;
  updateCandidate: (id: number, updatedData: Partial<Omit<CandidateData, 'id' | 'totalBets'>>) => void;
  removeCandidate: (id: number) => void;
  totalPot: number;
  currentUser: User;
};

const BetContext = createContext<BetContextType | undefined>(undefined);

const mockCurrentUser: User = {
    id: 'user-123',
    name: 'John Doe',
}

const initialBets: Bet[] = [
    {
      id: 'BET-001',
      userId: 'user-123',
      candidateName: 'Lazarus Chakwera',
      amount: 5000,
      placedDate: '2024-07-20',
      status: 'Pending',
    },
    {
      id: 'BET-002',
      userId: 'user-123',
      candidateName: 'Peter Mutharika',
      amount: 10000,
      placedDate: '2024-07-18',
      status: 'Pending',
    },
    {
      id: 'BET-003',
      userId: 'user-456', // Belongs to another user
      candidateName: 'Dalitso Kabambe',
      amount: 2500,
      placedDate: '2024-07-15',
      status: 'Pending',
    },
      {
      id: 'BET-004',
      userId: 'user-123',
      candidateName: 'Lazarus Chakwera',
      amount: 2000,
      placedDate: '2024-07-21',
      status: 'Pending',
    },
];

const initialCandidates: CandidateData[] = [
  { id: 1, name: "Lazarus Chakwera", image: "https://times.mw/wp-content/uploads/2023/07/lazarus-chakwera-2-860x1014.jpg", hint: "malawian man politician", totalBets: 75000, status: 'Active' },
  { id: 2, name: "Peter Mutharika", image: "https://www.peaceparks.org/wp-content/uploads/2018/08/image-51-2.jpeg", hint: "malawian man suit", totalBets: 62000, status: 'Active' },
  { id: 3, name: "Dalitso Kabambe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCBX_R1SzYblo8R62us3MuJgBw5pIQ_w7pYboMeFzE5eHHmD31CqmrJSjMlXaiKQ0fZQ&usqp=CAU", hint: "malawian man economist", totalBets: 48000, status: 'Active' },
  { id: 4, name: "Atupele Muluzi", image: "https://www.nyasatimes.com/wp-content/uploads/ATUPELE-MINISTER.jpg", hint: "malawian man leader", totalBets: 35000, status: 'Active' },
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
        const activeCandidates = prevData.filter(c => c.status === 'Active');
        if (activeCandidates.length === 0) return prevData;

        const newChartData = [...prevData];
        let betAmount = 0;

        // With a 40% chance, give a large boost to a candidate who is not in the lead
        if (Math.random() < 0.4 && activeCandidates.length > 1) {
           const sortedByBets = [...activeCandidates].sort((a, b) => b.totalBets - a.totalBets);
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
          const randomIndexInActive = Math.floor(Math.random() * activeCandidates.length);
          const candidateName = activeCandidates[randomIndexInActive].name;
          const originalIndex = newChartData.findIndex(c => c.name === candidateName);
          
          if(originalIndex !== -1) {
            betAmount = Math.floor(Math.random() * 5 + 1) * 100; // 100 to 500 MWK
            newChartData[originalIndex].totalBets += betAmount;
          }
        }

        setTotalPot(pot => pot + betAmount);
        return newChartData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [electionFinalized]);

  const addBet = (newBet: NewBet) => {
    if (electionFinalized) return;
    const candidate = candidates.find(c => c.name === newBet.candidateName);
    if (candidate?.status === 'Withdrawn') {
        // Optionally, show a toast or message that bets cannot be placed on withdrawn candidates
        console.error("Cannot place bet on a withdrawn candidate.");
        return;
    }

    const betWithDetails: Bet = {
      ...newBet,
      id: `BET-${String(bets.length + 1).padStart(3, '0')}`,
      userId: mockCurrentUser.id,
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

  const addCandidate = (candidate: Omit<CandidateData, 'id' | 'totalBets' | 'status'>) => {
    const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
    const newCandidate: CandidateData = {
        ...candidate,
        id: newId,
        totalBets: 0,
        status: 'Active',
    };
    setCandidates(prev => [...prev, newCandidate]);
  };

  const updateCandidate = (id: number, updatedData: Partial<Omit<CandidateData, 'id' | 'totalBets'>>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const removeCandidate = (id: number) => {
    // Note: In a real app, you'd need to handle what happens to bets on this candidate.
    // For this prototype, we'll just remove them.
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  return (
    <BetContext.Provider value={{ 
        bets, 
        addBet, 
        finalizeElection, 
        electionFinalized, 
        electionWinner, 
        candidates,
        addCandidate,
        updateCandidate,
        removeCandidate,
        totalPot, 
        currentUser: mockCurrentUser 
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
