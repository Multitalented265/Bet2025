
"use server"

import { addUser, getUserByEmail } from "@/lib/data"
import { revalidatePath } from "next/cache"
import bcrypt from 'bcryptjs';

type FormResult = {
  success: boolean
  error?: string
}

// Basic email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleSignup(formData: FormData): Promise<FormResult> {
  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Trim whitespace from all inputs
  const trimmedFullName = fullName?.trim()
  const trimmedEmail = email?.trim().toLowerCase()

  if (!trimmedFullName || !trimmedEmail || !password || !confirmPassword) {
    return { success: false, error: "Please fill out all required fields." }
  }

  if (trimmedFullName.length < 2) {
    return { success: false, error: "Full name must be at least 2 characters long." }
  }

  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, error: "Please enter a valid email address."}
  }

  if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long."}
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match. Please make sure both passwords are identical." }
  }

  try {
    const existingUser = await getUserByEmail(trimmedEmail)
    if (existingUser) {
        return { success: false, error: "An account with this email address already exists. Please try logging in instead." }
    }

    await addUser({ name: trimmedFullName, email: trimmedEmail, password: password })
    
    return { success: true }
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "An unexpected error occurred while creating your account. Please try again." }
  }
}
