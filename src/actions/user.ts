
"use server";

import { revalidatePath } from "next/cache";
import { addTransaction, createSupportTicket, updateUser as dbUpdateUser, getTransactions as dbGetTransactions, getCurrentUser } from "@/lib/data";


export async function handleTransaction(type: 'Deposit' | 'Withdrawal', amount: number) {
  const currentUser = await getCurrentUser();
  const fee = amount * 0.025; // 2.5% fee
  await addTransaction({
    type,
    amount,
    fee,
    userId: currentUser.id,
  });
  revalidatePath('/wallet');
  revalidatePath('/admin/revenue');
}

export async function getUserTransactions() {
    const currentUser = await getCurrentUser();
    const allTransactions = await dbGetTransactions();
    return allTransactions.filter(tx => tx.userId === currentUser.id);
}

export async function handleCreateSupportTicket(formData: FormData) {
    const currentUser = await getCurrentUser();
    const newTicket = {
        user: {
            name: currentUser.name,
            email: currentUser.email,
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
    const currentUser = await getCurrentUser();
    const updatedData = {
        name: formData.get("fullName") as string,
        email: formData.get("email") as string,
    };
    await dbUpdateUser(currentUser.id, updatedData);
    revalidatePath('/profile');
    revalidatePath('/settings');
}

export async function handlePasswordChange(values: any) {
    const currentUser = await getCurrentUser();
    // In a real app, you would validate the current password and update it.
    console.log("Password change requested for user:", currentUser.id, values);
    // This requires a more complex implementation involving checking current password and hashing the new one.
    // For now, it remains a console log.
}

export async function handleNotificationSettings(formData: FormData) {
    const currentUser = await getCurrentUser();
    const settings = {
        notifyOnBetStatusUpdates: formData.get("bet-status-updates") === "on",
    };
    await dbUpdateUser(currentUser.id, settings);
    revalidatePath('/settings');
}
