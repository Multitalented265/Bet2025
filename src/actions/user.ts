
"use server";

import { revalidatePath } from "next/cache";
import { addTransaction, createSupportTicket, updateUser as dbUpdateUser, getUsers, getTransactions as dbGetTransactions } from "@/lib/data";
import type { User } from "@/context/bet-context";

// A mock function to get the "logged-in" user.
// In a real app, you'd get this from session/auth state.
async function getMockCurrentUser(): Promise<User> {
    const users = await getUsers();
    if (users.length === 0) {
        throw new Error("No users found in the database. Please sign up first.");
    }
    // For now, we'll assume the first user is the logged in one.
    const { id, name } = users[0];
    return { id, name };
}

export async function handleTransaction(type: 'Deposit' | 'Withdrawal', amount: number) {
  const currentUser = await getMockCurrentUser();
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
    const currentUser = await getMockCurrentUser();
    const allTransactions = await dbGetTransactions();
    return allTransactions.filter(tx => tx.userId === currentUser.id);
}

export async function handleCreateSupportTicket(formData: FormData) {
    const currentUser = await getMockCurrentUser(); // Assume ticket is from current logged in user
    const newTicket = {
        user: {
            name: currentUser.name,
            email: (await getUsers()).find(u => u.id === currentUser.id)?.email || 'N/A', // get user's email
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
    const currentUser = await getMockCurrentUser();
    const updatedData = {
        name: formData.get("fullName") as string,
        email: formData.get("email") as string,
    };
    await dbUpdateUser(currentUser.id, updatedData);
    revalidatePath('/profile');
    revalidatePath('/settings');
}

export async function handlePasswordChange(values: any) {
    const currentUser = await getMockCurrentUser();
    // In a real app, you would validate the current password and update it.
    console.log("Password change requested for user:", currentUser.id, values);
    // This requires a more complex implementation involving checking current password and hashing the new one.
    // For now, it remains a console log.
}

export async function handleNotificationSettings(formData: FormData) {
    const currentUser = await getMockCurrentUser();
    const settings = {
        notifyOnBetStatusUpdates: formData.get("bet-status-updates") === "on",
    };
    await dbUpdateUser(currentUser.id, settings);
    revalidatePath('/settings');
}
