
"use server"

import { revalidatePath } from "next/cache";
import { placeBet, getCandidates } from "@/lib/data"
import { getSession } from "@/lib/auth";

export const handleBetPlacement = async (candidateId: number, amount: number) => {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to place a bet.");
  }
  
  const allCandidates = await getCandidates();
  const candidate = allCandidates.find(can => can.id === candidateId);
  
  if (!candidate) {
      throw new Error("Candidate not found");
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
}
