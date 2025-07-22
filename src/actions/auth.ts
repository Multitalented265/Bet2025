
"use server"

import { addUser, getUserByEmail } from "@/lib/data"
import { revalidatePath } from "next/cache"

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

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { success: false, error: "A user with this email already exists." }
  }

  // In a real app, you would hash the password here before saving
  await addUser({ name: fullName, email: email, password: password })
  revalidatePath("/")

  return { success: true }
}

export async function handleLogin(formData: FormData): Promise<FormResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Please provide both email and password." }
  }

  const user = await getUserByEmail(email)

  if (!user) {
    return { success: false, error: "No user found with that email address." }
  }

  // In a real app, you would use a secure comparison function for the password
  if (user.password !== password) {
    return { success: false, error: "Incorrect password." }
  }

  // In a real app, you would create a session here.
  // For now, we just return success.
  return { success: true }
}
