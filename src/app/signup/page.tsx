
"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
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
import { GoogleIcon } from "@/components/icons/google-icon"
import { handleSignup } from "@/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { handleError } from "@/lib/utils"

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("fullName", data.fullName)
        formData.append("email", data.email)
        formData.append("password", data.password)
        formData.append("confirmPassword", data.confirmPassword)

        const result = await handleSignup(formData)
        
        if (result.success) {
          toast({
            title: "Account Created Successfully! 🎉",
            description: "Please log in with your new credentials.",
          });
          router.push("/login");
        } else {
          const userFriendlyMessage = handleError(result.error || "Signup failed");
          toast({
            variant: "destructive",
            title: "Signup Failed",
            description: userFriendlyMessage,
          })
        }
      } catch (error) {
        const userFriendlyMessage = handleError(error as Error);
        toast({
          variant: "destructive",
          title: "Signup Error",
          description: userFriendlyMessage,
        })
      }
    })
  }

  return (
    <div className="flex sm:items-center sm:justify-center min-h-screen bg-primary sm:p-4">
      <Card className="w-full h-screen sm:h-auto sm:w-full sm:max-w-sm border-0 sm:border sm:rounded-lg">
        <CardContent className="pt-6 sm:pt-4">
          <div className="flex flex-col items-center text-center space-y-1 mb-4">
            <Logo size="xl" className="h-28 sm:h-32 md:h-36" />
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName" 
                {...form.register("fullName")}
                placeholder="Enter your full name"
                disabled={isPending} 
              />
              {form.formState.errors.fullName && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{form.formState.errors.fullName.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
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
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  {...form.register("password")}
                  placeholder="Enter your password"
                  disabled={isPending} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
              {form.formState.errors.password && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{form.formState.errors.password.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  {...form.register("confirmPassword")}
                  placeholder="Confirm your password"
                  disabled={isPending} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{form.formState.errors.confirmPassword.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button type="submit" className="w-full font-bold mt-4" disabled={isPending}>
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              type="button" 
              disabled={isPending}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
