
"use server";

import { revalidatePath } from "next/cache";
import { addCandidate as dbAddCandidate, updateCandidate as dbUpdateCandidate, removeCandidate as dbRemoveCandidate } from "@/lib/data";
import type { CandidateData } from "@/lib/data";

export async function handleAddCandidate(formData: FormData) {
    const newCandidate = {
      name: formData.get("name") as string,
      image: formData.get("imageUrl") as string,
      hint: formData.get("hint") as string,
      color: formData.get("color") as string,
    }
    if (!newCandidate.name || !newCandidate.image || !newCandidate.hint || !newCandidate.color) {
        throw new Error("Missing required candidate fields.");
    }
    await dbAddCandidate(newCandidate);
    revalidatePath("/admin/candidates");
}

export async function handleUpdateCandidate(candidateId: number, formData: FormData) {
    const updatedData: Partial<CandidateData> = {
      name: formData.get("name") as string,
      image: formData.get("imageUrl") as string,
      hint: formData.get("hint") as string,
      color: formData.get("color") as string,
    }
     if (!updatedData.name || !updatedData.image || !updatedData.hint || !updatedData.color) {
        throw new Error("Missing required candidate fields.");
    }
    await dbUpdateCandidate(candidateId, updatedData);
    revalidatePath("/admin/candidates");
}

export async function handleRemoveCandidate(candidateId: number) {
    await dbRemoveCandidate(candidateId);
    revalidatePath("/admin/candidates");
}

export async function handleUpdateCandidateStatus(candidateId: number, currentStatus: 'Active' | 'Withdrawn') {
    const newStatus = currentStatus === 'Active' ? 'Withdrawn' : 'Active';
    await dbUpdateCandidate(candidateId, { status: newStatus });
    revalidatePath("/admin/candidates");
}


export async function handleAdminPasswordChange(values: any) {
    // In a real app, you'd validate the current password and update the database.
    console.log("Admin password change requested:", values);
    // No revalidation needed as we are not changing visible data.
}

export async function handleAdminNotificationSettings(formData: FormData) {
    const settings = {
        enable2fa: formData.get("enable-2fa") === "on",
        newUser: formData.get("newUser") === "on",
        largeBet: formData.get("largeBet") === "on",
        largeDeposit: formData.get("largeDeposit") === "on",
    };
    // In a real app, you would save these settings to the admin's user profile in the database.
    console.log("Admin notification settings saved:", settings);
    // No revalidation needed as we are not changing visible data.
}
