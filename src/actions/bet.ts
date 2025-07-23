
"use server"

import { revalidatePath } from "next/cache";
import { placeBet, getCandidates, getCurrentUser } from "@/lib/data"

export const handleBetPlacement = async (candidateId: number, amount: number) => {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error("You must be logged in to place a bet.");
  }
  
  const allCandidates = await getCandidates();
  const candidate = allCandidates.find(can => can.id === candidateId);
  
  if (!candidate) {
      throw new Error("Candidate not found");
  }

  if (candidate.status === 'Withdrawn') {
    throw new Error("This candidate has withdrawn. Betting is closed.");
  }

  await placeBet({
    candidateName: candidate.name,
    amount,
    userId: user.id
  })

  // Revalidate paths to update data on the client
  revalidatePath("/dashboard");
  revalidatePath("/bets");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
}
