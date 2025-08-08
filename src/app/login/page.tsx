"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { useToast } from "@/hooks/use-toast"
import { handleError } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  console.log("--- [Login Page] ---");
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { toast } = useToast()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      try {
        console.log(`[Login Page] Attempting to sign in for email: ${data.email}`);
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        console.log("[Login Page] signIn result:", result);

        if (result?.error) {
          console.error("[Login Page] SignIn failed. Error:", result.error);
          const userFriendlyMessage = handleError("Invalid email or password. Please check your credentials and try again.");
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: userFriendlyMessage,
          });
        } else if (result?.ok) {
          console.log("[Login Page] SignIn successful. Redirecting to", callbackUrl);
          toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting to your dashboard.",
          });
          router.push(callbackUrl);
        } else {
          console.warn("[Login Page] signIn result was not 'ok' and not an 'error'. Result:", result);
          const userFriendlyMessage = handleError("An unexpected error occurred. Please try again.");
          toast({
            variant: "destructive",
            title: "Login Error",
            description: userFriendlyMessage,
          });
        }
      } catch (error) {
        const userFriendlyMessage = handleError(error as Error);
        toast({
          variant: "destructive",
          title: "Login Error",
          description: userFriendlyMessage,
        });
      }
    });
  }

  return (
    <div className="flex sm:items-center sm:justify-center min-h-screen bg-primary sm:p-4">
      <Card className="w-full h-screen sm:h-auto sm:w-full sm:max-w-sm border-0 sm:border sm:rounded-lg">
        <CardHeader className="space-y-0 pt-16 sm:pt-6">
          <div className="flex justify-center mb-2">
            <Logo size="xl" className="h-20 sm:h-24 md:h-28" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Invalid email or password. Please check your credentials and try again.
              </AlertDescription>
            </Alert>
          )}
          
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
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password *</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm underline text-primary hover:text-primary/80"
                >
                  Forgot your password?
                </Link>
              </div>
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
            
            <Button type="submit" className="w-full font-bold mt-4" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              type="button" 
              disabled={isPending}
              onClick={() => signIn("google", { callbackUrl })}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Login with Google
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 