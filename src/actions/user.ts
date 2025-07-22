
"use server";

import { revalidatePath } from "next/cache";
import { addTransaction, createSupportTicket, updateUser as dbUpdateUser } from "@/lib/data";
import type { User } from "@/context/bet-context";

const mockCurrentUser: User = {
    id: 'user-123',
    name: 'John Doe',
}

export async function handleTransaction(type: 'Deposit' | 'Withdrawal', amount: number) {
  const fee = amount * 0.025; // 2.5% fee
  await addTransaction({
    type,
    amount,
    fee,
    userId: mockCurrentUser.id,
  });
  // In a real app, you'd also update the user's balance in the database.
  revalidatePath('/wallet');
  revalidatePath('/admin/revenue');
}

export async function handleCreateSupportTicket(formData: FormData) {
    const newTicket = {
        user: {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
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
    const updatedData = {
        name: formData.get("fullName") as string,
        email: formData.get("email") as string,
    };
    await dbUpdateUser(mockCurrentUser.id, updatedData);
    revalidatePath('/profile');
    revalidatePath('/settings');
}

export async function handlePasswordChange(values: any) {
    // In a real app, you would validate the current password and update it.
    console.log("Password change requested for user:", mockCurrentUser.id, values);
    revalidatePath('/profile');
    revalidatePath('/settings');
}

export async function handleNotificationSettings(formData: FormData) {
    const settings = {
        betStatusUpdates: formData.get("bet-status-updates") === "on",
    };
    // In a real app, you would save these settings to the user's profile.
    console.log("Notification settings saved for user:", mockCurrentUser.id, settings);
}
