
/**
 * @fileoverview This file acts as a mock database for the application.
 * It provides functions to fetch and manipulate data for users, candidates, and bets.
 * In a real-world application, this would be replaced with a proper database connection (e.g., Prisma, Drizzle, etc.).
 */
"use server";

import { revalidatePath } from "next/cache";
import type { Bet } from "@/components/bet-ticket";

export type CandidateData = {
  id: number;
  name: string;
  image: string;
  hint: string;
  color: string;
  totalBets: number;
  status: 'Active' | 'Withdrawn';
};

export type User = {
  id:string;
  name: string;
  email: string;
  joined: string;
  status: "Active" | "Suspended";
  totalBets: number;
  bets: Bet[];
};

export type Transaction = {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  fee: number;
  date: string;
  userId: string;
};

export type SupportTicket = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  subject: string;
  message: string;
  date: string;
  status: 'Open' | 'Closed';
};


// --- ID Generation ---
function generateId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}


// --- MOCK DATABASE ---

let users: User[] = [
  { id: generateId('usr'), name: "John Doe", email: "john.doe@example.com", joined: "2024-07-20", status: "Active", totalBets: 0, bets: [] },
  { id: generateId('usr'), name: "Jane Smith", email: "jane.smith@example.com", joined: "2024-07-15", status: "Active", totalBets: 0, bets: [] },
  { id: generateId('usr'), name: "Charlie Brown", email: "charlie@example.com", joined: "2024-07-05", status: "Suspended", totalBets: 0, bets: [] },
];

let candidates: CandidateData[] = [
  { id: 1, name: "Lazarus Chakwera", image: "https://times.mw/wp-content/uploads/2023/07/lazarus-chakwera-2-860x1014.jpg", hint: "malawian man politician", color: "#14213d", totalBets: 75000, status: 'Active' },
  { id: 2, name: "Peter Mutharika", image: "https://www.peaceparks.org/wp-content/uploads/2018/08/image-51-2.jpeg", hint: "malawian man suit", color: "#87CEEB", totalBets: 62000, status: 'Active' },
  { id: 3, name: "Dalitso Kabambe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCBX_R1SzYblo8R62us3MuJgBw5pIQ_w7pYboMeFzE5eHHmD31CqmrJSjMlXaiKQ0fZQ&usqp=CAU", hint: "malawian man economist", color: "#FF0000", totalBets: 48000, status: 'Active' },
  { id: 4, name: "Atupele Muluzi", image: "https://www.nyasatimes.com/wp-content/uploads/ATUPELE-MINISTER.jpg", hint: "malawian man leader", color: "#FFD700", totalBets: 35000, status: 'Active' },
];

let bets: Bet[] = [
    { id: generateId('bet'), userId: users[0].id, candidateName: 'Lazarus Chakwera', amount: 5000, placedDate: '2024-07-20', status: 'Pending' },
    { id: generateId('bet'), userId: users[0].id, candidateName: 'Peter Mutharika', amount: 10000, placedDate: '2024-07-18', status: 'Pending' },
    { id: generateId('bet'), userId: users[1].id, candidateName: 'Dalitso Kabambe', amount: 2500, placedDate: '2024-07-15', status: 'Pending' },
    { id: generateId('bet'), userId: users[0].id, candidateName: 'Lazarus Chakwera', amount: 2000, placedDate: '2024-07-21', status: 'Pending' },
];

let transactions: Transaction[] = [
  { id: generateId('txn'), type: 'Deposit', amount: 50000, fee: 1250, date: '2024-07-25', userId: users[0].id },
  { id: generateId('txn'), type: 'Withdrawal', amount: 10000, fee: 250, date: '2024-07-24', userId: users[1].id },
  { id: generateId('txn'), type: 'Deposit', amount: 20000, fee: 500, date: '2024-07-23', userId: users[2].id },
  { id: generateId('txn'), type: 'Deposit', amount: 75000, fee: 1875, date: '2024-07-22', userId: users[0].id },
  { id: generateId('txn'), type: 'Withdrawal', amount: 5000, fee: 125, date: '2024-07-21', userId: users[2].id },
  { id: generateId('txn'), type: 'Deposit', amount: 100000, fee: 2500, date: '2024-07-20', userId: users[1].id },
];

let supportTickets: SupportTicket[] = [
  {
    id: generateId('tkt'),
    user: { name: 'John Doe', email: 'john.doe@example.com' },
    subject: 'Withdrawal Issue',
    message: 'I tried to withdraw my winnings but the transaction failed. Can you please check what happened? My balance is correct.',
    date: '2024-07-26',
    status: 'Open',
  },
  {
    id: generateId('tkt'),
    user: { name: 'Jane Smith', email: 'jane.smith@example.com' },
    subject: 'Question about Bet Settlement',
    message: "My bet on Lazarus Chakwera was marked as 'Lost' but he won the election. Could this be a mistake?",
    date: '2024-07-25',
    status: 'Open',
  },
  {
    id: generateId('tkt'),
    user: { name: 'Charlie Brown', email: 'charlie@example.com' },
    subject: 'Account Suspended',
    message: "Why is my account suspended? I haven't done anything wrong. Please reactivate it.",
    date: '2024-07-24',
    status: 'Closed',
  },
];


// --- DATA ACCESS FUNCTIONS ---

// Candidates
export async function getCandidates(): Promise<CandidateData[]> {
  // In a real app, you'd fetch this from your database
  return Promise.resolve(candidates);
}

export async function addCandidate(candidate: Omit<CandidateData, 'id' | 'totalBets' | 'status'>) {
    const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
    const newCandidate: CandidateData = {
        ...candidate,
        id: newId,
        totalBets: 0,
        status: 'Active',
    };
    candidates.push(newCandidate);
    revalidatePath("/admin/candidates");
    return Promise.resolve(newCandidate);
}

export async function updateCandidate(id: number, updatedData: Partial<Omit<CandidateData, 'id' | 'totalBets'>>) {
    candidates = candidates.map(c => c.id === id ? { ...c, ...updatedData } : c);
    revalidatePath("/admin/candidates");
    return Promise.resolve(candidates.find(c => c.id === id));
}

export async function removeCandidate(id: number) {
    candidates = candidates.filter(c => c.id !== id);
    revalidatePath("/admin/candidates");
    return Promise.resolve();
}

// Users
export async function getUsers(): Promise<User[]> {
    const userWithBets = users.map(user => {
        const userBets = bets.filter(bet => bet.userId === user.id);
        const totalBets = userBets.reduce((acc, bet) => acc + bet.amount, 0);
        return { ...user, bets: userBets, totalBets };
    });
    return Promise.resolve(userWithBets);
}

export async function updateUser(id: string, updatedData: Partial<Omit<User, 'id' | 'bets' | 'totalBets'>>) {
    users = users.map(u => u.id === id ? { ...u, ...updatedData } as User : u);
    revalidatePath("/admin/users");
    revalidatePath("/(dashboard)/profile");
    revalidatePath("/(dashboard)/settings");
    return Promise.resolve(users.find(u => u.id === id));
}

// Bets
export async function getBets(): Promise<Bet[]> {
  return Promise.resolve(bets);
}

export async function placeBet(newBet: Omit<Bet, 'id' | 'placedDate' | 'status'>) {
    const betWithDetails: Bet = {
      ...newBet,
      id: generateId('bet'),
      placedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    bets.unshift(betWithDetails);

    // Update candidate's total bets
    const candidateIndex = candidates.findIndex(c => c.name === newBet.candidateName);
    if(candidateIndex !== -1) {
        candidates[candidateIndex].totalBets += newBet.amount;
    }
    
    // No revalidation needed here as the calling action will do it.
    return Promise.resolve(betWithDetails);
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
    return Promise.resolve(transactions);
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'date'>) {
    const newTransaction: Transaction = {
        ...transaction,
        id: generateId('txn'),
        date: new Date().toISOString().split('T')[0],
    };
    transactions.unshift(newTransaction);
    revalidatePath('/wallet');
    revalidatePath('/admin/revenue');
    return Promise.resolve(newTransaction);
}

// Support Tickets
export async function getSupportTickets(): Promise<SupportTicket[]> {
    return Promise.resolve(supportTickets);
}

export async function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'status'>) {
    const newTicket: SupportTicket = {
        ...ticket,
        id: generateId('tkt'),
        date: new Date().toISOString().split('T')[0],
        status: 'Open',
    }
    supportTickets.unshift(newTicket);
    revalidatePath('/admin/support');
    return Promise.resolve(newTicket);
}

export async function updateSupportTicketStatus(id: string, status: 'Open' | 'Closed') {
    supportTickets = supportTickets.map(t => t.id === id ? { ...t, status } : t);
    revalidatePath("/admin/support");
    return Promise.resolve(supportTickets.find(t => t.id === id));
}
