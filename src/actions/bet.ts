
"use server"

import { revalidatePath } from "next/cache";
import { placeBet, getCandidates, getUserById } from "@/lib/data"
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const handleBetPlacement = async (candidateId: number, amount: number) => {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/");
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
    userId: session.user.id
  })

  // Revalidate paths to update data on the client
  revalidatePath("/dashboard");
  revalidatePath("/bets");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
}
