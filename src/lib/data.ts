
/**
 * @fileoverview This file acts as the data access layer for the application.
 * It provides functions to fetch and manipulate data for users, candidates, and bets
 * using Prisma to interact with the PostgreSQL database.
 */
"use server";

import { revalidatePath } from "next/cache";
import prisma from "./db";
import type { User as PrismaUser, Candidate as PrismaCandidate, Bet as PrismaBet, Transaction as PrismaTransaction, SupportTicket as PrismaSupportTicket, AdminSettings as PrismaAdminSettings } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { getSession } from "./auth";

// Re-exporting Prisma types to be used in components if needed
export type { User, Candidate as CandidateData, Bet, Transaction, SupportTicket, AdminSettings } from "@prisma/client";


// --- Candidates ---
export async function getCandidates() {
  const candidates = await prisma.candidate.findMany({
    orderBy: {
      totalBets: 'desc'
    }
  });
  // Prisma returns Decimal types for money, so we convert them to numbers
  return candidates.map(c => ({...c, totalBets: c.totalBets.toNumber()}));
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
    return updatedCandidate;
}

export async function removeCandidate(id: number) {
    await prisma.candidate.delete({ where: { id } });
    revalidatePath("/admin/candidates");
    return Promise.resolve();
}

// --- Users ---
export async function getUsers() {
    const users = await prisma.user.findMany({
       orderBy: {
        joined: 'desc'
      }
    });

    return users.map(user => ({
      ...user,
      balance: user.balance.toNumber(),
    }));
}

export async function getUsersWithBetDetails() {
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

    return users.map(user => {
      const totalBets = user.bets.reduce((acc, bet) => acc + bet.amount.toNumber(), 0);
      return {
        ...user,
        balance: user.balance.toNumber(),
        totalBets: totalBets,
        bets: user.bets.map(b => ({...b, amount: b.amount.toNumber()})),
        joined: user.joined.toISOString().split('T')[0] // Return date as YYYY-MM-DD string
      }
    });
}


export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.user?.id) {
        // This case should ideally not be hit if pages are protected
        return null;
    }
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });
    if (!user) {
        // This might happen if the user is deleted but the session is still active
        return null;
    }
    return {
        ...user,
        balance: user.balance.toNumber(),
    }
}

export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) return null;
    return { ...user, balance: user.balance.toNumber() };
}


export async function getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) return null;
    return { ...user, balance: user.balance.toNumber() };
}

export async function addUser(userData: Omit<PrismaUser, 'id' | 'joined' | 'status' | 'balance' | 'notifyOnBetStatusUpdates' | 'emailVerified' | 'image' >) {
    if (!userData.password) {
        throw new Error("Password is required to create a user.");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            balance: 50000, // Starting balance
        },
    });
    return newUser;
}

export async function updateUser(id: string, updatedData: Partial<Omit<PrismaUser, 'id'>>) {
    const updatedUser = await prisma.user.update({
        where: { id },
        data: updatedData
    });

    revalidatePath("/admin/users");
    revalidatePath("/(dashboard)/profile");
    revalidatePath("/(dashboard)/settings");

    return updatedUser;
}

// --- Bets ---
export async function getBets() {
    const bets = await prisma.bet.findMany({
        orderBy: {
            placedDate: 'desc'
        }
    });
    return bets.map(b => ({...b, amount: b.amount.toNumber()}));
}

export async function placeBet(newBet: { userId: string, candidateName: string, amount: number }) {
    // Using a transaction to ensure both Bet creation and Candidate update happen together
    return await prisma.$transaction(async (tx) => {
        const candidate = await tx.candidate.findUnique({
             where: { name: newBet.candidateName },
             select: { id: true }
        });
        if (!candidate) throw new Error("Candidate not found for betting.");

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

        return bet;
    });
}

// --- Transactions ---
export async function getTransactions() {
    const transactions = await prisma.transaction.findMany({
        orderBy: {
            date: 'desc'
        }
    });
    return transactions.map(t => ({
        ...t,
        amount: t.amount.toNumber(),
        fee: t.fee.toNumber(),
    }));
}

export async function addTransaction(transaction: Omit<PrismaTransaction, 'id' | 'date'>) {
    // In a transaction, update user balance and create transaction record
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: transaction.userId }});
        if (!user) throw new Error("User not found");

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

        const newTransaction = await tx.transaction.create({
            data: {
                ...transaction,
                amount: transaction.amount,
                fee: transaction.fee,
            }
        });

        revalidatePath('/wallet');
        revalidatePath('/admin/revenue');

        return newTransaction;
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
        user: JSON.parse(ticket.user as string) // Assuming user is stored as a JSON string
    }));
}

export async function createSupportTicket(ticket: Omit<PrismaSupportTicket, 'id' | 'date' | 'status'>) {
    const newTicket = await prisma.supportTicket.create({
        data: {
            ...ticket,
            user: JSON.stringify(ticket.user) // Storing the user object as a JSON string
        }
    });
    revalidatePath('/admin/support');
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
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
        // If no settings exist, create with default values
        settings = await prisma.adminSettings.create({
            data: {
                id: 1, // Singleton ID
                enable2fa: false,
                notifyOnNewUser: true,
                notifyOnLargeBet: false,
                notifyOnLargeDeposit: true
            }
        });
    }
    return settings;
}

export async function updateAdminSettings(data: Partial<Omit<PrismaAdminSettings, 'id'>>) {
    return prisma.adminSettings.update({
        where: { id: 1 },
        data
    });
}
