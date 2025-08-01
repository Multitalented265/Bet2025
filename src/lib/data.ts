/**
 * @fileoverview This file acts as the data access layer for the application.
 * It provides functions to fetch and manipulate data for users, candidates, and bets
 * using Prisma to interact with the PostgreSQL database.
 */
"use server";

import { revalidatePath } from "next/cache";
import { unstable_cache } from 'next/cache';
import { prisma } from "./db";
import bcrypt from 'bcryptjs';

// Define types for the application
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  balance: number;
  joined: Date;
  status: string;
  notifyOnBetStatusUpdates: boolean;
};

export type CandidateData = {
  id: number;
  name: string;
  image: string;
  hint: string;
  color: string;
  totalBets: number;
  status: string;
};

export type CandidateWithBetCount = CandidateData & {
  betCount: number;
};

export type Bet = {
  id: string;
  userId: string;
  candidateId: number;
  candidateName: string;
  amount: number;
  placedDate: Date;
  status: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  fee: number;
  date: Date;
  txRef: string | null;
  status: string;
};

export type SupportTicket = {
  id: string;
  user: User;
  subject: string;
  message: string;
  date: Date;
  status: string;
};

export type AdminSettings = {
  id: number;
  enable2fa: boolean;
  notifyOnNewUser: boolean;
  notifyOnNewUserLogin: boolean;
  notifyOnLargeBet: boolean;
  notifyOnLargeDeposit: boolean;
  bettingEnabled: boolean;
};

// Prisma types for database operations
type PrismaCandidate = {
  id: number;
  name: string;
  image: string;
  hint: string;
  color: string;
  totalBets: any; // Prisma Decimal
  status: string;
  bets?: PrismaBet[];
};

type PrismaBet = {
  id: string;
  userId: string;
  candidateId: number;
  candidateName: string;
  amount: any; // Prisma Decimal
  placedDate: Date;
  status: string;
};

type PrismaUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  balance: any; // Prisma Decimal
  joined: Date;
  status: string;
  notifyOnBetStatusUpdates: boolean;
  bets?: PrismaBet[];
};

type PrismaTransaction = {
  id: string;
  userId: string;
  type: string;
  amount: any; // Prisma Decimal
  fee: any; // Prisma Decimal
  date: Date;
  txRef: string | null;
  status: string;
};

// Cached data fetching functions
const getCachedCandidates = unstable_cache(
  async () => {
    try {
      const candidates = await prisma.candidate.findMany({
        orderBy: {
          totalBets: 'desc'
        }
      });
      return candidates.map((c: PrismaCandidate) => ({...c, totalBets: c.totalBets.toNumber()}));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['candidates'],
  { revalidate: 30 } // Cache for 30 seconds
);

const getCachedUsers = unstable_cache(
  async () => {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          joined: 'desc'
        }
      });
      return users.map((user: PrismaUser) => ({
        ...user,
        balance: user.balance.toNumber()
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['users'],
  { revalidate: 30 } // Cache for 30 seconds
);

const getCachedBets = unstable_cache(
  async () => {
    try {
      const bets = await prisma.bet.findMany({
        orderBy: {
          placedDate: 'desc'
        }
      });
      return bets.map((bet: PrismaBet) => ({
        ...bet,
        amount: bet.amount.toNumber()
      }));
    } catch (error) {
      console.error('Error fetching bets:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['bets'],
  { revalidate: 30 } // Cache for 30 seconds
);

const getCachedTransactions = unstable_cache(
  async () => {
    try {
      const transactions = await prisma.transaction.findMany({
        orderBy: {
          date: 'desc'
        }
      });
      return transactions.map((tx: PrismaTransaction) => ({
        ...tx,
        amount: tx.amount.toNumber(),
        fee: tx.fee.toNumber()
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['transactions'],
  { revalidate: 30 } // Cache for 30 seconds
);

const getCachedCandidatesWithBetCounts = unstable_cache(
  async () => {
    try {
      console.log('🔍 Fetching candidates with bet counts...');
      const candidates = await prisma.candidate.findMany({
        include: {
          bets: true
        },
        orderBy: {
          totalBets: 'desc'
        }
      });
      
      const result = candidates.map((c: PrismaCandidate & { bets: PrismaBet[] }) => ({
        ...c, 
        totalBets: c.totalBets.toNumber(),
        betCount: c.bets.length // Number of people who bet on this candidate
      }));
      
      console.log('📊 Bet counts:', result.map((c: CandidateWithBetCount) => `${c.name}: ${c.betCount} bets`));
      return result;
    } catch (error) {
      console.error('Error fetching candidates with bet counts:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['candidates-with-bet-counts-v3'],
  { revalidate: 5 } // Cache for 5 seconds to ensure fresh data
);

// --- Candidates ---
export async function getCandidates() {
  return getCachedCandidates();
}

export async function getCandidatesWithBetCounts() {
  return getCachedCandidatesWithBetCounts();
}

export async function addCandidate(candidate: { name: string, image: string, hint: string, color: string }) {
    const newCandidate = await prisma.candidate.create({
        data: {
            ...candidate,
            totalBets: 0,
            status: 'Active',
        }
    });
    revalidatePath("/admin/candidates");
    return newCandidate;
}

export async function updateCandidate(id: number, updatedData: Partial<{ name: string; image: string; hint: string; color: string; status: 'Active' | 'Withdrawn' }>) {
    const updatedCandidate = await prisma.candidate.update({
        where: { id },
        data: updatedData
    });
    revalidatePath("/admin/candidates");
    revalidatePath("/dashboard");
    return updatedCandidate;
}

export async function removeCandidate(id: number) {
    await prisma.candidate.delete({ where: { id } });
    revalidatePath("/admin/candidates");
    return Promise.resolve();
}

// --- Users ---
export async function getUsers() {
    return getCachedUsers();
}

export async function getUsersWithBetDetails() {
    try {
      const users = await prisma.user.findMany({
        include: {
          bets: {
            select: {
              id: true,
              candidateName: true,
              amount: true,
            }
          },
        },
         orderBy: {
          joined: 'desc'
        }
      });

      return users.map((user: any) => {
        const totalBets = user.bets.reduce((acc: number, bet: any) => acc + bet.amount.toNumber(), 0);
        return {
          ...user,
          balance: user.balance.toNumber(),
          totalBets: totalBets,
          bets: user.bets.map((b: any) => ({...b, amount: b.amount.toNumber()})),
          joined: user.joined.toISOString().split('T')[0] // Return date as YYYY-MM-DD string
        }
      });
    } catch (error) {
      console.error('Error fetching users with bet details:', error);
      // Return empty array during build if database is not available
      return [];
    }
}

export async function getUserById(id: string) {
    return getCachedUserById(id);
}

export async function getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) return null;
    return { ...user, balance: user.balance.toNumber() };
}

export async function addUser(userData: Omit<User, 'id' | 'joined' | 'status' | 'balance' | 'notifyOnBetStatusUpdates' | 'emailVerified' | 'image' >) {
    if (!userData.password) {
        throw new Error("Password is required to create a user.");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            // Use default balance from schema (0.00) instead of hardcoded 50000
        },
    });

    // Send notification for new user registration
    try {
        const { notifyNewUser } = await import('./notifications');
        await notifyNewUser({
            name: newUser.name || 'Unknown',
            email: newUser.email || 'Unknown'
        });
    } catch (notificationError) {
        console.error('Error sending new user notification:', notificationError);
    }

    revalidatePath("/admin/users");
    return { ...newUser, balance: newUser.balance.toNumber() };
}

export async function updateUser(id: string, updatedData: Partial<Omit<User, 'id' | 'password'>> & { password?: string }) {
    const updateData: any = { ...updatedData };
    
    if (updatedData.password) {
        updateData.password = await bcrypt.hash(updatedData.password, 10);
    }
    
    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
    });
    
    revalidatePath("/admin/users");
    return { ...updatedUser, balance: updatedUser.balance.toNumber() };
}

// --- Bets ---
export async function getBets() {
    return getCachedBets();
}

export async function placeBet(newBet: { userId: string, candidateName: string, amount: number }) {
    return await prisma.$transaction(async (tx: any) => {
        // Check if betting is enabled
        const adminSettings = await tx.adminSettings.findFirst();
        if (!adminSettings?.bettingEnabled) {
            throw new Error("Betting has been disabled by the administrator.");
        }

        // Validate bet amount
        if (newBet.amount < 100) {
            throw new Error("Minimum bet amount is 100 MWK");
        }
        if (newBet.amount > 1000000) {
            throw new Error("Maximum bet amount is 1,000,000 MWK");
        }

        // Get user and check balance
        const user = await tx.user.findUnique({
            where: { id: newBet.userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const currentBalance = user.balance.toNumber();
        if (currentBalance < newBet.amount) {
            throw new Error("Insufficient balance");
        }

        // Get candidate and check if they're active
        const candidate = await tx.candidate.findFirst({
            where: { 
                name: newBet.candidateName,
                status: 'Active'
            }
        });

        if (!candidate) {
            throw new Error("Candidate not found or has withdrawn from the election");
        }

        // Check if candidate has withdrawn
        if (candidate.status === 'Withdrawn') {
            throw new Error("This candidate has withdrawn from the election. You cannot place a bet on them.");
        }

        // Deduct amount from user balance
        await tx.user.update({
            where: { id: newBet.userId },
            data: { balance: { decrement: newBet.amount } }
        });

        // Add bet amount to candidate's total
        await tx.candidate.update({
            where: { id: candidate.id },
            data: { totalBets: { increment: newBet.amount } }
        });

        // Create the bet
        const bet = await tx.bet.create({
            data: {
                userId: newBet.userId,
                candidateId: candidate.id,
                candidateName: newBet.candidateName,
                amount: newBet.amount,
                status: 'Active'
            }
        });

        // Send notification for large bet
        if (newBet.amount >= 10000) { // 10,000 MWK threshold
            try {
                const { notifyLargeBet } = await import('./notifications');
                await notifyLargeBet({
                    userId: user.id,
                    userName: user.name || 'Unknown',
                    candidateName: newBet.candidateName,
                    amount: newBet.amount
                });
            } catch (notificationError) {
                console.error('Error sending large bet notification:', notificationError);
            }
        }

        revalidatePath("/dashboard");
        revalidatePath("/admin/bets");
        revalidatePath("/admin/users");
        
        return { ...bet, amount: bet.amount.toNumber() };
    });
}

// --- Transactions ---
export async function getTransactions() {
    return getCachedTransactions();
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'date'> & { txRef?: string; status?: string }) {
    const newTransaction = await prisma.transaction.create({
        data: {
            userId: transaction.userId,
            type: transaction.type,
            amount: transaction.amount,
            fee: transaction.fee,
            txRef: transaction.txRef || null,
            status: transaction.status || 'pending',
            date: new Date()
        }
    });

    // Send notification for large deposit
    if (transaction.type === 'Deposit' && transaction.amount >= 50000) { // 50,000 MWK threshold
        try {
            const user = await prisma.user.findUnique({
                where: { id: transaction.userId }
            });
            
            if (user) {
                const { notifyLargeDeposit } = await import('./notifications');
                await notifyLargeDeposit({
                    userId: user.id,
                    userName: user.name || 'Unknown',
                    amount: transaction.amount,
                    type: transaction.type
                });
            }
        } catch (notificationError) {
            console.error('Error sending large deposit notification:', notificationError);
        }
    }

    revalidatePath("/admin/transactions");
    return { ...newTransaction, amount: newTransaction.amount.toNumber(), fee: newTransaction.fee.toNumber() };
}

// --- Support Tickets ---
export async function getSupportTickets() {
    try {
      const tickets = await prisma.supportTicket.findMany({
        orderBy: {
          date: 'desc'
        }
      });
      return tickets.map((ticket: any) => ({
        ...ticket,
        user: JSON.parse(ticket.user as string)
      }));
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }
}

export async function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'status'>) {
    const newTicket = await prisma.supportTicket.create({
        data: {
            user: JSON.stringify(ticket.user),
            subject: ticket.subject,
            message: ticket.message,
            date: new Date(),
            status: 'Open'
        }
    });
    revalidatePath("/admin/support");
    return newTicket;
}

export async function updateSupportTicketStatus(id: string, status: 'Open' | 'Closed') {
    const updatedTicket = await prisma.supportTicket.update({
        where: { id },
        data: { status }
    });
    revalidatePath("/admin/support");
    return updatedTicket;
}

// --- Admin Settings ---
export async function getAdminSettings() {
    const settings = await prisma.adminSettings.findFirst();
    return settings || {
        id: 1,
        enable2fa: false,
        notifyOnNewUser: true,
        notifyOnNewUserLogin: true,
        notifyOnLargeBet: true,
        notifyOnLargeDeposit: true,
        bettingEnabled: true
    };
}

export async function updateAdminSettings(data: Partial<Omit<AdminSettings, 'id'>>) {
    const settings = await prisma.adminSettings.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data }
    });
    revalidatePath("/admin/settings");
    return settings;
}

export async function updateBettingStatus(enabled: boolean) {
    return await updateAdminSettings({ bettingEnabled: enabled });
}

// --- Election Finalization ---
export async function finalizeElection(winningCandidateName: string) {
    return await prisma.$transaction(async (tx: any) => {
        // Get all candidates and their total bets
        const candidates = await tx.candidate.findMany();
        const allBets = await tx.bet.findMany({
            where: { status: 'Active' }
        });

        // Calculate total pot
        const totalPot = candidates.reduce((acc: number, candidate: PrismaCandidate) => {
            return acc + candidate.totalBets.toNumber();
        }, 0);

        // Get all bets for the winning candidate
        const winningCandidate = candidates.find((c: PrismaCandidate) => c.name === winningCandidateName);
        if (!winningCandidate) {
            throw new Error("Winning candidate not found");
        }

        const winningBets = allBets.filter((bet: PrismaBet) => bet.candidateName === winningCandidateName);
        const totalWinningBets = winningBets.reduce((acc: number, bet: PrismaBet) => acc + bet.amount.toNumber(), 0);

        // Calculate payouts for each winning bet
        const payouts: { userId: string; amount: number }[] = [];
        
        winningBets.forEach((bet: PrismaBet) => {
            const betAmount = bet.amount.toNumber();
            const payoutRatio = betAmount / totalWinningBets;
            const payout = totalPot * payoutRatio;
            payouts.push({
                userId: bet.userId,
                amount: payout
            });
        });

        // Update user balances with winnings
        for (const payout of payouts) {
            await tx.user.update({
                where: { id: payout.userId },
                data: { balance: { increment: payout.amount } }
            });
        }

        // Mark all bets as completed
        await tx.bet.updateMany({
            where: { status: 'Active' },
            data: { status: 'Completed' }
        });

        // Disable betting
        await tx.adminSettings.upsert({
            where: { id: 1 },
            update: { bettingEnabled: false },
            create: { id: 1, bettingEnabled: false }
        });

        // Send notifications to winners
        for (const payout of payouts) {
            try {
                const user = await tx.user.findUnique({
                    where: { id: payout.userId }
                });
                
                if (user) {
                    // Send user notification for bet status update
                    const { sendUserNotification } = await import('./notifications');
                    await sendUserNotification(user.id, {
                        subject: 'Bet Status Update',
                        message: `Your bet on ${winningCandidateName} has been settled. You won ${payout.amount.toLocaleString()} MWK!`,
                        type: 'betWon',
                        metadata: {
                            candidateName: winningCandidateName,
                            betAmount: winningBets.find((b: PrismaBet) => b.userId === payout.userId)?.amount.toNumber() || 0,
                            payoutAmount: payout.amount,
                            status: 'Won'
                        }
                    });
                }
            } catch (notificationError) {
                console.error('Error sending bet status notification:', notificationError);
            }
        }

        revalidatePath("/dashboard");
        revalidatePath("/admin/bets");
        revalidatePath("/admin/users");

        return {
            totalPot,
            totalWinningBets,
            winningCandidate: winningCandidateName,
            payouts
        };
    });
}

// --- Potential Winnings Calculation ---
export async function calculatePotentialWinnings(betAmount: number, candidateName: string): Promise<number> {
    const candidates = await getCandidates();
    const candidate = candidates.find(c => c.name === candidateName);
    
    if (!candidate) {
        return 0;
    }

    const totalPot = candidates.reduce((acc, c) => acc + c.totalBets, 0);
    const candidateTotal = candidate.totalBets;
    
    if (candidateTotal === 0) {
        return totalPot; // If no one else has bet on this candidate, you get the entire pot
    }

    const betRatio = betAmount / (candidateTotal + betAmount);
    return totalPot * betRatio;
}

// --- Bet Statistics ---
export async function getBetStatistics() {
    try {
        const [totalBets, totalAmount, userCount, candidateCount] = await Promise.all([
            prisma.bet.count(),
            prisma.bet.aggregate({
                _sum: { amount: true }
            }),
            prisma.user.count(),
            prisma.candidate.count()
        ]);

        const averageBetAmount = totalBets > 0 && totalAmount._sum.amount ? totalAmount._sum.amount.toNumber() / totalBets : 0;

        return {
            totalBets,
            totalAmount: totalAmount._sum.amount?.toNumber() || 0,
            averageBetAmount,
            userCount,
            candidateCount
        };
    } catch (error) {
        console.error('Error fetching bet statistics:', error);
        return {
            totalBets: 0,
            totalAmount: 0,
            averageBetAmount: 0,
            userCount: 0,
            candidateCount: 0
        };
    }
}

// --- Admin Login Tracking ---
export async function getAdminLoginLogs(limit: number = 50) {
    try {
        const logs = await prisma.adminLoginLog.findMany({
            orderBy: { loginTime: 'desc' },
            take: limit
        });
        return logs;
    } catch (error) {
        console.error('Error fetching admin login logs:', error);
        return [];
    }
}

export async function getAdminLoginStats() {
    try {
        const [totalLogins, uniqueIPs, recentLogins] = await Promise.all([
            prisma.adminLoginLog.count(),
            prisma.adminLoginLog.groupBy({
                by: ['ipAddress'],
                _count: { ipAddress: true }
            }),
            prisma.adminLoginLog.count({
                where: {
                    loginTime: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            })
        ]);

        return {
            totalLogins,
            uniqueIPs: uniqueIPs.length,
            recentLogins
        };
    } catch (error) {
        console.error('Error fetching admin login stats:', error);
        return {
            totalLogins: 0,
            uniqueIPs: 0,
            recentLogins: 0
        };
    }
}

// --- Cache Management ---
export async function invalidateUserCache(userId: string) {
    // This would invalidate user-specific caches if needed
    revalidatePath(`/admin/users`);
    revalidatePath(`/dashboard`);
}

// Cached user by ID function
const getCachedUserById = unstable_cache(
    async (id: string) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id }
            });
            if (!user) return null;
            return { ...user, balance: user.balance.toNumber() };
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            return null;
        }
    },
    ['user-by-id'],
    { revalidate: 30 }
);
