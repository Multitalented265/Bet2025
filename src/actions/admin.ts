
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

