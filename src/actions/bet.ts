
"use server"

import { revalidatePath } from "next/cache";
import { placeBet, getUsers } from "@/lib/data"
import type { User } from "@/context/bet-context";


// A mock function to get the "logged-in" user.
// In a real app, you'd get this from session/auth state.
async function getMockCurrentUser(): Promise<User> {
    const users = await getUsers();
    if (users.length === 0) {
        throw new Error("No users found in the database.");
    }
    const { id, name } = users[0];
    return { id, name };
}

export const handleBetPlacement = async (candidateId: number, amount: number) => {
  const currentUser = await getMockCurrentUser();
  console.log(`Bet placed on candidate ${candidateId} for ${amount} MWK by user ${currentUser.id}`)
  const candidate = (await import("@/lib/data")).getCandidates().then(c => c.find(can => can.id === candidateId));
  if (!candidate) {
      throw new Error("Candidate not found");
  }

  await placeBet({
    candidateName: (await candidate).name,
    amount,
    userId: currentUser.id
  })

  // Revalidate paths to update data on the client
  revalidatePath("/dashboard");
  revalidatePath("/bets");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
}
