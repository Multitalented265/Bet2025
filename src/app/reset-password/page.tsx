"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const token = searchParams.get('token')

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Invalid Reset Link",
        description: "The reset link is invalid or has expired.",
      })
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            token,
            password: data.password 
          }),
        })

        const result = await response.json()

        if (response.ok) {
          toast({
            title: "Password Reset Successful",
            description: "Your password has been reset successfully. You can now login with your new password.",
          })
          router.push('/')
        } else {
          toast({
            variant: "destructive",
            title: "Reset Failed",
            description: result.error || "Failed to reset password. The link may have expired.",
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

  if (!token) {
    return (
      <div className="flex sm:items-center sm:justify-center min-h-screen bg-primary sm:p-4">
        <Card className="w-full h-screen sm:h-auto sm:w-full sm:max-w-sm border-0 sm:border sm:rounded-lg">
          <CardHeader className="space-y-4 pt-16 sm:pt-6">
            <div className="flex justify-center">
              <Logo size="xl" className="h-20 sm:h-24 md:h-28" />
            </div>
            <CardTitle className="text-2xl font-headline text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link href="/forgot-password" className="inline-flex items-center text-primary hover:text-primary/80">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Request New Reset Link
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex sm:items-center sm:justify-center min-h-screen bg-primary sm:p-4">
      <Card className="w-full h-screen sm:h-auto sm:w-full sm:max-w-sm border-0 sm:border sm:rounded-lg">
        <CardHeader className="space-y-4 pt-16 sm:pt-6">
          <div className="flex justify-center">
            <Logo size="xl" className="h-20 sm:h-24 md:h-28" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password *</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Enter your new password"
                disabled={isPending}
              />
              {form.formState.errors.password && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{form.formState.errors.password.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register("confirmPassword")}
                placeholder="Confirm your new password"
                disabled={isPending}
              />
              {form.formState.errors.confirmPassword && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{form.formState.errors.confirmPassword.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button type="submit" className="w-full font-bold mt-4" disabled={isPending}>
              {isPending ? "Resetting..." : "Reset Password"}
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