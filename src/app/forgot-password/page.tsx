"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Logo from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: data.email }),
        })

        const result = await response.json()

        if (response.ok) {
          toast({
            title: "Reset Email Sent",
            description: "If an account with that email exists, we've sent a password reset link.",
          })
          router.push('/')
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Failed to send reset email. Please try again.",
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        })
      }
    })
  }

  return (
    <div className="flex sm:items-center sm:justify-center min-h-screen bg-primary sm:p-4">
      <Card className="w-full h-screen sm:h-auto sm:w-full sm:max-w-sm border-0 sm:border sm:rounded-lg">
        <CardHeader className="space-y-4 pt-16 sm:pt-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter your email address"
                disabled={isPending}
              />
              {form.formState.errors.email && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{form.formState.errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button type="submit" className="w-full font-bold mt-4" disabled={isPending}>
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 