
"use server";

import { revalidatePath } from "next/cache";
import { addTransaction, createSupportTicket, updateUser as dbUpdateUser, getTransactions as dbGetTransactions, getUserById } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";




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
        redirect("/");
    }
    const user = await getUserById(session.user.id);
     if (!user) {
        throw new Error("User not found.");
    }

    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const newTicket = {
        user: user,
        subject: subject,
        message: message,
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
      redirect("/");
    }
    const updatedData = {
        name: formData.get("fullName") as string,
        email: formData.get("email") as string,
    };
    await dbUpdateUser(session.user.id, updatedData);
    revalidatePath('/settings');
}

export async function handlePasswordChange(values: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    const session = await getSession();
    if (!session?.user?.id) {
        redirect("/");
    }

    // Get user to verify current password
    const user = await getUserById(session.user.id);
    if (!user) {
        throw new Error("User not found");
    }

    // Verify current password
    if (!user.password) {
        throw new Error("No password set for this account");
    }

    const isCurrentPasswordValid = await bcrypt.compare(values.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(values.newPassword, 10);
    await dbUpdateUser(session.user.id, { password: hashedNewPassword });

    revalidatePath('/settings');
}

export async function handleNotificationSettings(formData: FormData) {
    const session = await getSession();
    if (!session?.user?.id) {
        redirect("/");
    }
    const settings = {
        notifyOnBetStatusUpdates: formData.get("bet-status-updates") === "on",
    };
    await dbUpdateUser(session.user.id, settings);
    revalidatePath('/settings');
}
