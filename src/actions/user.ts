
"use server";

import { revalidatePath } from "next/cache";
import { addTransaction, createSupportTicket, updateUser as dbUpdateUser, getTransactions as dbGetTransactions, getUserById } from "@/lib/data";
import { getSession } from "next-auth/react";


export async function handleTransaction(type: 'Deposit' | 'Withdrawal', amount: number) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("User not found");
  }

  const fee = amount * 0.025; // 2.5% fee
  await addTransaction({
    type,
    amount,
    fee,
    userId: session.user.id,
  });
  revalidatePath('/wallet');
  revalidatePath('/admin/revenue');
}

export async function getUserTransactions() {
    const session = await getSession();
    if (!session?.user?.id) {
        return [];
    }
    const allTransactions = await dbGetTransactions();
    return allTransactions.filter(tx => tx.userId === session.user.id);
}

export async function handleCreateSupportTicket(formData: FormData) {
    const session = await getSession();
    if (!session?.user?.id) {
        throw new Error("User not authenticated.");
    }
    const user = await getUserById(session.user.id);
     if (!user) {
        throw new Error("User not found.");
    }

    const newTicket = {
        user: {
            name: user.name,
            email: user.email,
        },
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
    };
    if (!newTicket.user.name || !newTicket.user.email || !newTicket.subject || !newTicket.message) {
        throw new Error("Missing required ticket fields.");
    }
    await createSupportTicket(newTicket);
    revalidatePath("/admin/support");
}

export async function handleProfileUpdate(formData: FormData) {
    const session = await getSession();
    if (!session?.user?.id) {
        throw new Error("User not authenticated.");
    }
    const updatedData = {
        name: formData.get("fullName") as string,
        email: formData.get("email") as string,
    };
    await dbUpdateUser(session.user.id, updatedData);
    revalidatePath('/profile');
    revalidatePath('/settings');
}

export async function handlePasswordChange(values: any) {
    const session = await getSession();
     if (!session?.user?.id) {
        throw new Error("User not authenticated.");
    }
    // In a real app, you would validate the current password and update it.
    console.log("Password change requested for user:", session.user.id, values);
    // This requires a more complex implementation involving checking current password and hashing the new one.
    // For now, it remains a console log.
}

export async function handleNotificationSettings(formData: FormData) {
    const session = await getSession();
    if (!session?.user?.id) {
        throw new Error("User not authenticated.");
    }
    const settings = {
        notifyOnBetStatusUpdates: formData.get("bet-status-updates") === "on",
    };
    await dbUpdateUser(session.user.id, settings);
    revalidatePath('/settings');
}
