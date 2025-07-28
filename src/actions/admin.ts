
"use server";

import { revalidatePath } from "next/cache";
import { getAdminSettings, finalizeElection, updateAdminSettings } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function fetchAdminSettings() {
  try {
    const settings = await getAdminSettings();
    return settings;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw new Error('Failed to fetch admin settings');
  }
}

export async function handleAdminPasswordChange(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // In a real app, you'd verify the current password and check if user is admin
  // For now, we'll just update the admin password
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  
  // Find the first admin user and update their password
  const admin = await prisma.admin.findFirst({
    where: { isActive: true }
  });
  
  if (!admin) {
    throw new Error("No admin user found");
  }
  
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedPassword }
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function handleAdminNotificationSettings(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // In a real app, you'd check if user is admin
  const enable2fa = formData.get("enable2fa") === "on";
  const notifyOnNewUser = formData.get("notifyOnNewUser") === "on";
  const notifyOnLargeBet = formData.get("notifyOnLargeBet") === "on";
  const notifyOnLargeDeposit = formData.get("notifyOnLargeDeposit") === "on";

  await updateAdminSettings({
    enable2fa,
    notifyOnNewUser,
    notifyOnLargeBet,
    notifyOnLargeDeposit
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function stopAllBetting() {
    const session = await getSession();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // In a real app, you'd check if user is admin
    const adminSettings = await getAdminSettings();
    if (!adminSettings.bettingEnabled) {
        throw new Error("Betting is already disabled");
    }

    // Update admin settings to disable betting
    const updated = await prisma.adminSettings.update({
        where: { id: 1 },
        data: { bettingEnabled: false }
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/bets");

    return updated;
}

export async function enableBetting() {
    const session = await getSession();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // In a real app, you'd check if user is admin
    const adminSettings = await getAdminSettings();
    if (adminSettings.bettingEnabled) {
        throw new Error("Betting is already enabled");
    }

    // Update admin settings to enable betting
    const updated = await prisma.adminSettings.update({
        where: { id: 1 },
        data: { bettingEnabled: true }
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/bets");

    return updated;
}

export async function finalizeElectionAction(winningCandidateName: string) {
    const session = await getSession();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // In a real app, you'd check if user is admin
    if (!winningCandidateName) {
        throw new Error("Winning candidate name is required");
    }

    try {
        const result = await finalizeElection(winningCandidateName);
        
        console.log(`Election finalized successfully:`, {
            winner: result.winner,
            totalPrizePool: result.totalPrizePool,
            winningBetsCount: result.winningBetsCount,
            totalBetsProcessed: result.totalBetsProcessed
        });

        return result;
    } catch (error) {
        console.error('Election finalization failed:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to finalize election');
    }
}

// Candidate management functions
export async function handleAddCandidate(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const hint = formData.get("hint") as string;
  const color = formData.get("color") as string;

  if (!name || !image || !hint || !color) {
    throw new Error("All fields are required");
  }

  const candidate = await prisma.candidate.create({
    data: {
      name,
      image,
      hint,
      color,
      status: "Active"
    }
  });

  revalidatePath("/admin/candidates");
  return candidate;
}

export async function handleUpdateCandidate(id: number, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const hint = formData.get("hint") as string;
  const color = formData.get("color") as string;

  if (!name || !image || !hint || !color) {
    throw new Error("All fields are required");
  }

  const candidate = await prisma.candidate.update({
    where: { id },
    data: {
      name,
      image,
      hint,
      color
    }
  });

  revalidatePath("/admin/candidates");
  return candidate;
}

export async function handleUpdateCandidateStatus(id: number, currentStatus: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

  const candidate = await prisma.candidate.update({
    where: { id },
    data: { status: newStatus }
  });

  revalidatePath("/admin/candidates");
  return candidate;
}

export async function handleRemoveCandidate(id: number) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if there are any bets for this candidate
  const betsCount = await prisma.bet.count({
    where: { candidateId: id }
  });

  if (betsCount > 0) {
    throw new Error("Cannot remove candidate with existing bets");
  }

  await prisma.candidate.delete({
    where: { id }
  });

  revalidatePath("/admin/candidates");
  return { success: true };
}
