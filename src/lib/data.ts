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

export type Bet = {
  id: string;
  userId: string;
  candidateId: number;
  candidateName: string;
  amount: number;
  placedDate: Date | string;
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
  user: any;
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
  maintenanceMode: boolean;
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
      return candidates.map((c: any) => ({...c, totalBets: c.totalBets.toNumber()}));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['candidates'],
  { revalidate: 10 } // Cache for 10 seconds (reduced from 30)
);

const getCachedUsers = unstable_cache(
  async () => {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          joined: 'desc'
        }
      });
      return users.map((user: any) => ({
        ...user,
        balance: user.balance.toNumber(),
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['users'],
  { revalidate: 60 } // Cache for 1 minute
);

const getCachedBets = unstable_cache(
  async () => {
    try {
      const bets = await prisma.bet.findMany({
        orderBy: {
          placedDate: 'desc'
        }
      });
      return bets.map((bet: any) => ({
        id: bet.id,
        userId: bet.userId,
        candidateId: bet.candidateId,
        candidateName: bet.candidateName,
        amount: bet.amount.toNumber(),
        placedDate: bet.placedDate.toISOString(), // Convert to ISO string for proper serialization
        status: bet.status,
      }));
    } catch (error) {
      console.error('Error fetching bets:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['bets'],
  { revalidate: 10 } // Cache for 10 seconds (reduced for better responsiveness)
);

const getCachedTransactions = unstable_cache(
  async () => {
    try {
      const transactions = await prisma.transaction.findMany({
        orderBy: {
          date: 'desc'
        }
      });
      return transactions.map((tx: any) => ({
        ...tx,
        amount: tx.amount.toNumber(),
        fee: tx.fee.toNumber(),
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return empty array during build if database is not available
      return [];
    }
  },
  ['transactions'],
  { revalidate: 10 } // Cache for 10 seconds (reduced for better responsiveness)
);

const getCachedUserById = unstable_cache(
  async (id: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) return null;
      return { ...user, balance: user.balance.toNumber() };
    } catch (error) {
      console.error('Error fetching user by id:', error);
      return null;
    }
  },
  ['user-by-id'],
  { revalidate: 60 } // Cache for 1 minute
);

const getCachedAdminSettings = unstable_cache(
  async () => {
    try {
      let settings = await prisma.adminSettings.findUnique({
        where: { id: 1 }
      });
      
      if (!settings) {
        settings = await prisma.adminSettings.create({
          data: {
            id: 1,
            enable2fa: false,
            notifyOnNewUser: true,
            notifyOnNewUserLogin: false,
            notifyOnLargeBet: false,
            notifyOnLargeDeposit: true,
            bettingEnabled: true,
            maintenanceMode: false
          } as any
        });
      } else {
        const updateData: any = {};
        if ((settings as any).bettingEnabled === undefined) {
          updateData.bettingEnabled = true;
        }
        if ((settings as any).maintenanceMode === undefined) {
          updateData.maintenanceMode = false;
        }
        if (Object.keys(updateData).length > 0) {
          settings = await prisma.adminSettings.update({
            where: { id: 1 },
            data: updateData as any,
          });
        }
      }
      return settings;
    } catch (error) {
      console.error('Error in getAdminSettings:', error);
      // Return default settings during build if database is not available
      return {
        id: 1,
        enable2fa: false,
        notifyOnNewUser: true,
        notifyOnNewUserLogin: false,
        notifyOnLargeBet: false,
        notifyOnLargeDeposit: true,
        bettingEnabled: true,
        maintenanceMode: false
      };
    }
  },
  ['admin-settings'],
  { revalidate: 5 } // Cache for 5 seconds (reduced for faster maintenance mode updates)
);

const getCachedCandidatesWithBetCounts = unstable_cache(
  async () => {
    try {
      console.log('🔍 Fetching candidates with bet counts...');
      const candidates = await prisma.candidate.findMany({
        include: {
          bets: true
        },
        where: {
          status: 'Active' // Only get active candidates
        },
        orderBy: {
          totalBets: 'desc'
        }
      });
      
      if (!candidates || candidates.length === 0) {
        console.log('No active candidates found, fetching all candidates...');
        // If no active candidates, get all candidates
        const allCandidates = await prisma.candidate.findMany({
          include: {
            bets: true
          },
          orderBy: {
            totalBets: 'desc'
          }
        });
        
        const result = allCandidates.map((c: any) => ({
          ...c, 
          totalBets: c.totalBets.toNumber(),
          betCount: c.bets.length // Number of people who bet on this candidate
        }));
        
        console.log('📊 Bet counts:', result.map((c: any) => `${c.name}: ${c.betCount} bets`));
        return result;
      }
      
      const result = candidates.map((c: any) => ({
        ...c, 
        totalBets: c.totalBets.toNumber(),
        betCount: c.bets.length // Number of people who bet on this candidate
      }));
      
      console.log('📊 Bet counts:', result.map((c: any) => `${c.name}: ${c.betCount} bets`));
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
            email: newUser.email || 'No email'
        });
    } catch (notificationError) {
        console.error('Error sending new user notification:', notificationError);
    }

    return { ...newUser, balance: newUser.balance.toNumber() };
}

export async function updateUser(id: string, updatedData: Partial<Omit<User, 'id' | 'password'>> & { password?: string }) {
    
    const dataToUpdate: Partial<User> = { ...updatedData };

    if (updatedData.password) {
        dataToUpdate.password = await bcrypt.hash(updatedData.password, 10);
    }
    
    const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate
    });

    revalidatePath("/admin/users");
    revalidatePath("/(dashboard)/settings");

    return { ...updatedUser, balance: updatedUser.balance.toNumber() };
}

// --- Bets ---
export async function getBets() {
    return getCachedBets();
}

export async function placeBet(newBet: { userId: string, candidateName: string, amount: number }) {
    // Using a transaction to ensure both Bet creation and Candidate update happen together
    return await prisma.$transaction(async (tx) => {
        // Validate minimum bet amount
        if (newBet.amount < 100) {
            throw new Error("Minimum bet amount is 100 MWK.");
        }

        // Validate maximum bet amount
        if (newBet.amount > 1000000) {
            throw new Error("Maximum bet amount is 1,000,000 MWK.");
        }

        const candidate = await tx.candidate.findFirst({
             where: { name: newBet.candidateName },
             select: { id: true, status: true }
        });
        if (!candidate) throw new Error("Candidate not found for betting.");
        if (candidate.status === 'Withdrawn') throw new Error("This candidate has withdrawn. You cannot place a bet.");

        // Check user balance
        const user = await tx.user.findUnique({ where: { id: newBet.userId } });
        if (!user || user.balance.toNumber() < newBet.amount) {
            throw new Error("Insufficient funds in your wallet. Please add money to your wallet before placing a bet.");
        }

        // Deduct bet amount from user balance
        await tx.user.update({
            where: { id: newBet.userId },
            data: {
                balance: {
                    decrement: newBet.amount
                }
            }
        });


        const bet = await tx.bet.create({
            data: {
                userId: newBet.userId,
                candidateName: newBet.candidateName,
                amount: newBet.amount,
                candidateId: candidate.id
            }
        });

        await tx.candidate.update({
            where: { name: newBet.candidateName },
            data: {
                totalBets: {
                    increment: newBet.amount
                }
            }
        });
        
        revalidatePath("/dashboard");
        revalidatePath("/admin/dashboard");
        
        // Invalidate user cache to ensure fresh balance data
        await invalidateUserCache(newBet.userId);
        
        // Send notification for large bets (over 1,000,000 MWK)
        if (newBet.amount >= 1000000) {
            try {
                const { notifyLargeBet } = await import('./notifications');
                await notifyLargeBet({
                    userId: newBet.userId,
                    userName: user.name || 'Unknown',
                    amount: newBet.amount,
                    candidateName: newBet.candidateName
                });
            } catch (notificationError) {
                console.error('Error sending large bet notification:', notificationError);
            }
        }
        
        return bet;
    });
}

// --- Transactions ---
export async function getTransactions() {
    return getCachedTransactions();
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'date'> & { txRef?: string; status?: string }) {
    // In a transaction, update user balance and create transaction record
    return await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.findUnique({ where: { id: transaction.userId }});
        if (!user) throw new Error("User not found");

        // Only update balance for completed transactions
        if (transaction.status === 'completed') {
            const newBalance = transaction.type === 'Deposit'
                ? user.balance.toNumber() + transaction.amount
                : user.balance.toNumber() - transaction.amount;

            if (newBalance < 0) {
                throw new Error("Insufficient funds for withdrawal.");
            }

            await tx.user.update({
                where: { id: transaction.userId },
                data: { balance: newBalance }
            });
        }

        const newTransaction = await tx.transaction.create({
            data: {
                ...transaction,
                amount: transaction.amount,
                fee: transaction.fee,
                txRef: transaction.txRef || null,
                status: transaction.status || 'pending',
            }
        });

        revalidatePath('/wallet');
        revalidatePath('/admin/revenue');
        
        // Invalidate user cache to ensure fresh balance data
        await invalidateUserCache(transaction.userId);

        // Send notification for large deposits (over 500,000 MWK)
        if (transaction.amount >= 500000 && transaction.status === 'completed') {
            try {
                const { notifyLargeDeposit } = await import('./notifications');
                await notifyLargeDeposit({
                    userId: transaction.userId,
                    userName: user.name || 'Unknown',
                    amount: transaction.amount,
                    type: transaction.type
                });
            } catch (notificationError) {
                console.error('Error sending large deposit notification:', notificationError);
            }
        }

        return { ...newTransaction, amount: newTransaction.amount.toNumber(), fee: newTransaction.fee.toNumber() };
    });
}

// --- Support Tickets ---
export async function getSupportTickets() {
    const tickets = await prisma.supportTicket.findMany({
        orderBy: {
            date: 'desc'
        }
    });
     return tickets.map(ticket => ({
        ...ticket,
        user: ticket.user as { name: string; email: string }, // Cast the JSON user data to the expected type
        date: ticket.date.toISOString(), // Convert Date to string for the client component
        status: ticket.status as 'Open' | 'Closed' // Cast status to the expected union type
    }));
}

export async function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'status'>) {
    const newTicket = await prisma.supportTicket.create({
        data: {
            ...ticket,
            status: 'Open',
        },
    });
    revalidatePath('/support');
    return newTicket;
}

export async function updateSupportTicketStatus(id: string, status: 'Open' | 'Closed') {
    const updatedTicket = await prisma.supportTicket.update({
        where: { id },
        data: { status },
    });
    revalidatePath('/support');
    return updatedTicket;
}

// --- Admin Settings ---
export async function getAdminSettings() {
    return getCachedAdminSettings();
}

export async function updateAdminSettings(data: Partial<Omit<AdminSettings, 'id'>>) {
    const updated = await prisma.adminSettings.update({
        where: { id: 1 },
        data: data as any,
    });
    revalidatePath('/admin/settings');
    return updated;
}

export async function updateBettingStatus(enabled: boolean) {
    const updated = await prisma.adminSettings.update({
        where: { id: 1 },
        data: { bettingEnabled: enabled },
    });
    revalidatePath('/admin/settings');
    return updated;
}

export async function finalizeElection(winningCandidateName: string) {
    return await prisma.$transaction(async (tx) => {
        // Get all candidates and bets
        const candidates = await tx.candidate.findMany();
        const allBets = await tx.bet.findMany({
            where: { status: 'Pending' }
        });

        // Calculate total prize pool
        const totalPrizePool = candidates.reduce((acc, candidate) => 
            acc + parseFloat(candidate.totalBets.toString()), 0
        );

        // Get winning candidate
        const winningCandidate = candidates.find(c => c.name === winningCandidateName);
        if (!winningCandidate) {
            throw new Error('Winning candidate not found');
        }

        // Get all bets on winning candidate
        const winningBets = allBets.filter(bet => bet.candidateName === winningCandidateName);
        const totalBetsOnWinner = winningBets.reduce((acc, bet) => 
            acc + parseFloat(bet.amount.toString()), 0
        );

        // Process each bet
        for (const bet of allBets) {
            const betAmount = parseFloat(bet.amount.toString());
            const isWinningBet = bet.candidateName === winningCandidateName;
            
            if (isWinningBet) {
                // Calculate winnings for winning bets
                const userShare = betAmount / totalBetsOnWinner;
                const winnings = userShare * totalPrizePool;
                
                // Update bet status to Won
                await tx.bet.update({
                    where: { id: bet.id },
                    data: { status: 'Won' }
                });

                // Credit user balance with winnings
                await tx.user.update({
                    where: { id: bet.userId },
                    data: {
                        balance: {
                            increment: winnings
                        }
                    }
                });

                // Create transaction record for winnings
                await tx.transaction.create({
                    data: {
                        userId: bet.userId,
                        type: 'Winnings',
                        amount: winnings,
                        fee: 0,
                        txRef: `WIN_${bet.id}`,
                        status: 'completed',
                        date: new Date()
                    }
                });

                console.log(`User ${bet.userId} won ${winnings} MWK from bet ${bet.id}`);
                
                // Send notification to user about winning bet
                try {
                    const { sendUserNotification } = await import('./notifications');
                    await sendUserNotification(bet.userId, {
                        subject: '🎉 Congratulations! Your Bet Won!',
                        message: `Great news! Your bet of ${betAmount} MWK on ${bet.candidateName} has won! You've earned ${winnings.toFixed(2)} MWK in winnings.`,
                        type: 'betWon',
                        metadata: {
                            betId: bet.id,
                            betAmount,
                            winnings,
                            candidateName: bet.candidateName
                        }
                    });
                } catch (notificationError) {
                    console.error('Error sending win notification:', notificationError);
                }
                
                // Invalidate user cache to ensure fresh balance data
                await invalidateUserCache(bet.userId);
            } else {
                // Update bet status to Lost (no balance change - money already deducted)
                await tx.bet.update({
                    where: { id: bet.id },
                    data: { status: 'Lost' }
                });

                console.log(`User ${bet.userId} lost bet ${bet.id} (${betAmount} MWK)`);
                
                // Send notification to user about losing bet
                try {
                    const { sendUserNotification } = await import('./notifications');
                    await sendUserNotification(bet.userId, {
                        subject: 'Bet Result: Not This Time',
                        message: `Your bet of ${betAmount} MWK on ${bet.candidateName} did not win this time. Better luck next time!`,
                        type: 'betLost',
                        metadata: {
                            betId: bet.id,
                            betAmount,
                            candidateName: bet.candidateName
                        }
                    });
                } catch (notificationError) {
                    console.error('Error sending loss notification:', notificationError);
                }
            }
        }

        // Disable betting
        await tx.adminSettings.update({
            where: { id: 1 },
            data: { bettingEnabled: false }
        });

        console.log(`Election finalized. Winner: ${winningCandidateName}`);
        console.log(`Total prize pool: ${totalPrizePool} MWK`);
        console.log(`Total bets on winner: ${totalBetsOnWinner} MWK`);
        console.log(`Winning bets processed: ${winningBets.length}`);

        revalidatePath("/dashboard");
        revalidatePath("/bets");
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/bets");

        return {
            success: true,
            winner: winningCandidateName,
            totalPrizePool,
            totalBetsOnWinner,
            winningBetsCount: winningBets.length,
            totalBetsProcessed: allBets.length
        };
    });
}

export async function calculatePotentialWinnings(betAmount: number, candidateName: string): Promise<number> {
    const candidates = await getCandidates();
    const totalPrizePool = candidates.reduce((acc, candidate) => acc + candidate.totalBets, 0);
    
    const candidate = candidates.find(c => c.name === candidateName);
    if (!candidate) return 0;
    
    const totalBetsOnCandidate = candidate.totalBets;
    if (totalBetsOnCandidate === 0) return 0;
    
    const userShare = betAmount / totalBetsOnCandidate;
    return userShare * totalPrizePool;
}

export async function getBetStatistics() {
    try {
      const [bets, candidates] = await Promise.all([
          prisma.bet.findMany({
              include: {
                  user: {
                      select: { name: true, email: true }
                  }
              }
          }),
          getCandidates()
      ]);

      const totalPrizePool = candidates.reduce((acc, candidate) => acc + candidate.totalBets, 0);
      
      const stats = {
          totalBets: bets.length,
          pendingBets: bets.filter(b => b.status === 'Pending').length,
          wonBets: bets.filter(b => b.status === 'Won').length,
          lostBets: bets.filter(b => b.status === 'Lost').length,
          totalPrizePool,
          totalAmountBet: bets.reduce((acc, bet) => acc + parseFloat(bet.amount.toString()), 0),
          averageBetAmount: bets.length > 0 ? 
              bets.reduce((acc, bet) => acc + parseFloat(bet.amount.toString()), 0) / bets.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching bet statistics:', error);
      // Return default stats during build if database is not available
      return {
        totalBets: 0,
        pendingBets: 0,
        wonBets: 0,
        lostBets: 0,
        totalPrizePool: 0,
        totalAmountBet: 0,
        averageBetAmount: 0
      };
    }
}

// --- Admin Login Tracking ---
export async function getAdminLoginLogs(limit: number = 50) {
  try {
    const logs = await prisma.adminLoginLog.findMany({
      orderBy: {
        loginTime: 'desc'
      },
      take: limit,
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    return logs.map(log => ({
      ...log,
      latitude: log.latitude?.toNumber(),
      longitude: log.longitude?.toNumber()
    }));
  } catch (error) {
    console.error('Error fetching admin login logs:', error);
    // Return empty array during build if database is not available
    return [];
  }
}

export async function getAdminLoginStats() {
  try {
    const [
      totalLogins,
      successfulLogins,
      failedLogins,
      uniqueAdmins,
      uniqueIPs,
      avgSessionDuration
    ] = await Promise.all([
      prisma.adminLoginLog.count(),
      prisma.adminLoginLog.count({ where: { isSuccessful: true } }),
      prisma.adminLoginLog.count({ where: { isSuccessful: false } }),
      prisma.adminLoginLog.groupBy({ by: ['adminId'], _count: true }),
      prisma.adminLoginLog.groupBy({ by: ['ipAddress'], _count: true }),
      prisma.adminLoginLog.aggregate({
        _avg: { sessionDuration: true },
        where: { sessionDuration: { not: null } }
      })
    ]);
    
    return {
      totalLogins,
      successfulLogins,
      failedLogins,
      uniqueAdmins: uniqueAdmins.length,
      uniqueIPs: uniqueIPs.length,
      averageSessionDuration: avgSessionDuration._avg.sessionDuration || 0
    };
  } catch (error) {
    console.error('Error fetching admin login stats:', error);
    // Return default stats during build if database is not available
    return {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      uniqueAdmins: 0,
      uniqueIPs: 0,
      averageSessionDuration: 0
    };
  }
}

// Add cache invalidation function
export async function invalidateUserCache(userId: string) {
  // Force revalidation by calling revalidatePath
  revalidatePath('/wallet');
  revalidatePath('/dashboard');
  revalidatePath('/admin/users');
}
