
"use server";

import { revalidatePath } from "next/cache";
import { getAdminSettings, finalizeElection, updateAdminSettings } from "@/lib/data";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
  const session = await getAdminSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Find the admin user
  const admin = await prisma.admin.findFirst({
    where: { isActive: true }
  });
  
  if (!admin) {
    throw new Error("No admin user found");
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, admin.password);
  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password and update
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedPassword }
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function handleAdminNotificationSettings(formData: FormData) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // In a real app, you'd check if user is admin
  const enable2fa = formData.get("enable-2fa") === "on";
  const notifyOnNewUser = formData.get("newUser") === "on";
  const notifyOnNewUserLogin = formData.get("newUserLogin") === "on";
  const notifyOnLargeBet = formData.get("largeBet") === "on";
  const notifyOnLargeDeposit = formData.get("largeDeposit") === "on";

  await updateAdminSettings({
    enable2fa,
    notifyOnNewUser,
    notifyOnNewUserLogin,
    notifyOnLargeBet,
    notifyOnLargeDeposit
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function stopAllBetting() {
    const session = await getAdminSession();
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
    const session = await getAdminSession();
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
    const session = await getAdminSession();
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

export async function handleAdminEmailChange(data: {
  currentPassword: string;
  newEmail: string;
}) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // In a real app, you'd verify the current password
  // For now, we'll just update the admin email
  
  // Find the first admin user and update their email
  const admin = await prisma.admin.findFirst({
    where: { isActive: true }
  });
  
  if (!admin) {
    throw new Error("No admin user found");
  }

  // Check if email is already in use
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: data.newEmail }
  });

  if (existingAdmin && existingAdmin.id !== admin.id) {
    throw new Error("Email is already in use by another admin");
  }
  
  await prisma.admin.update({
    where: { id: admin.id },
    data: { email: data.newEmail }
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function handleAdminForgotPassword(email: string) {
  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!admin) {
      // Don't reveal if admin exists or not for security
      return { success: true, message: "If an admin account with this email exists, a password reset link has been sent." };
    }

    // Check if admin is active
    if (!admin.isActive) {
      return { success: false, message: "This admin account is not active." };
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the reset token in the database
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpires
      }
    });

    // In a real application, you would:
    // 1. Send an email with the reset link
    // 2. Use a proper email service like SendGrid, AWS SES, etc.

    // For now, we'll just log the request
    console.log('=== ADMIN PASSWORD RESET REQUEST ===');
    console.log(`Email: ${email}`);
    console.log(`Admin ID: ${admin.id}`);
    console.log(`Admin Name: ${admin.name}`);
    console.log(`Admin Role: ${admin.role}`);
    console.log(`Admin Active: ${admin.isActive}`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Token Expires: ${resetTokenExpires.toISOString()}`);
    console.log(`Request Time: ${new Date().toISOString()}`);
    console.log('====================================');

    // In a real app, you would send an email here:
    // await sendPasswordResetEmail({
    //   to: email,
    //   resetToken: resetToken,
    //   adminName: admin.name,
    //   resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${resetToken}`
    // });

    return { success: true, message: "If an admin account with this email exists, a password reset link has been sent." };
  } catch (error) {
    console.error('Error in admin forgot password:', error);
    throw new Error('Failed to process password reset request');
  }
}

export async function handleAdminPasswordReset(token: string, newPassword: string) {
  try {
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    // Find admin by reset token
    const admin = await prisma.admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date() // Token hasn't expired
        }
      }
    });

    if (!admin) {
      return { success: false, message: 'Invalid or expired reset token.' };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update admin password and clear reset token
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    console.log('=== ADMIN PASSWORD RESET COMPLETED ===');
    console.log(`Admin ID: ${admin.id}`);
    console.log(`Admin Email: ${admin.email}`);
    console.log(`Admin Name: ${admin.name}`);
    console.log(`Reset Time: ${new Date().toISOString()}`);
    console.log('=====================================');

    return { success: true, message: 'Password has been reset successfully.' };
  } catch (error) {
    console.error('Error in admin password reset:', error);
    throw new Error('Failed to reset password');
  }
}

// Candidate management functions
export async function handleAddCandidate(formData: FormData) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const image = formData.get("imageUrl") as string;
  const hint = formData.get("hint") as string;
  const color = formData.get("color") as string;

  console.log('Adding candidate with data:', {
    name,
    imageLength: image?.length || 0,
    imageType: image?.startsWith('data:') ? 'base64' : 'url',
    hint,
    color
  });

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
  const session = await getAdminSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const image = formData.get("imageUrl") as string;
  const hint = formData.get("hint") as string;
  const color = formData.get("color") as string;

  console.log('Updating candidate with data:', {
    id,
    name,
    imageLength: image?.length || 0,
    imageType: image?.startsWith('data:') ? 'base64' : 'url',
    hint,
    color
  });

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
  const session = await getAdminSession();
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
  const session = await getAdminSession();
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
