
"use server"

import { revalidatePath } from "next/cache";
import { placeBet, getUsers, getCandidates } from "@/lib/data"
import type { User } from "@/context/bet-context";


// A mock function to get the "logged-in" user.
// In a real app, you'd get this from session/auth state.
async function getMockCurrentUser(): Promise<User> {
    const users = await getUsers();
    if (users.length === 0) {
        // This should not happen after signup is implemented.
        // For now, let's create a dummy user if none exists for development.
         throw new Error("No users found in database. Please sign up first.");
    }
    const { id, name } = users[0];
    return { id, name };
}

export const handleBetPlacement = async (candidateId: number, amount: number) => {
  const currentUser = await getMockCurrentUser();
  const allCandidates = await getCandidates();
  const candidate = allCandidates.find(can => can.id === candidateId);
  
  if (!candidate) {
      throw new Error("Candidate not found");
  }

  await placeBet({
    candidateName: candidate.name,
    amount,
    userId: currentUser.id
  })

  // Revalidate paths to update data on the client
  revalidatePath("/dashboard");
  revalidatePath("/bets");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
}
