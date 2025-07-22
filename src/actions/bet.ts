
"use server"

import { revalidatePath } from "next/cache";
import { placeBet } from "@/lib/data"
import type { User } from "@/context/bet-context";

const mockCurrentUser: User = {
    id: 'user-123',
    name: 'John Doe',
}

export const handleBetPlacement = async (candidateId: number, amount: number) => {
  console.log(`Bet placed on candidate ${candidateId} for ${amount} MWK`)
  const candidate = (await import("@/lib/data")).getCandidates().then(c => c.find(can => can.id === candidateId));
  if (!candidate) {
      throw new Error("Candidate not found");
  }

  await placeBet({
    candidateName: (await candidate).name,
    amount,
    userId: mockCurrentUser.id
  })

  // Revalidate paths to update data on the client
  revalidatePath("/dashboard");
  revalidatePath("/bets");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
}
