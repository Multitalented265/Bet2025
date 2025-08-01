
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

  if (!fullName || !email || !password || !confirmPassword) {
    return { success: false, error: "Please fill out all fields." }
  }

  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address."}
  }

  if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long."}
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." }
  }

  try {
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
        return { success: false, error: "A user with this email already exists." }
    }

    await addUser({ name: fullName, email: email, password: password })
    // No longer need to revalidate path here, as the user will be redirected.
    
    return { success: true }
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "An unexpected error occurred." }
  }
}
