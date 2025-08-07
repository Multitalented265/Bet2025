
"use server"

import { revalidatePath } from "next/cache";
import { placeBet, getCandidates, getUserById, getAdminSettings } from "@/lib/data"
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const handleBetPlacement = async (candidateId: number, amount: number) => {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      redirect("/");
    }
    
    // Check if betting is enabled
    const adminSettings = await getAdminSettings();
    if (!adminSettings.bettingEnabled) {
      return { success: false, error: "Betting has been disabled by the administrator." };
    }
    
    const allCandidates = await getCandidates();
    const candidate = allCandidates.find(can => can.id === candidateId);
    
    if (!candidate) {
      return { success: false, error: "Candidate not found" };
    }

    if (candidate.status === 'Withdrawn') {
      return { success: false, error: "This candidate has withdrawn. Betting is closed." };
    }

    await placeBet({
      candidateName: candidate.name,
      amount,
      userId: session.user.id
    })

    // Revalidate paths to update data on the client
    revalidatePath("/dashboard");
    revalidatePath("/bets");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    // Return the error message instead of throwing
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}
