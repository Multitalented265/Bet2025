
"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"

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
import Logo from "@/components/logo"
import { GoogleIcon } from "@/components/icons/google-icon"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default function LoginPage() {
  console.log("--- [Login Page] ---");
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    startTransition(async () => {
        console.log(`[Login Page] Attempting to sign in for email: ${email}`);
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        console.log("[Login Page] signIn result:", result);

        if (result?.error) {
            console.error("[Login Page] SignIn failed. Error:", result.error);
            // Re-render the page with an error query parameter
            router.push('/?error=CredentialsSignin');
            router.refresh();
        } else if (result?.ok) {
            // On success, redirect to the dashboard
             console.log("[Login Page] SignIn successful. Redirecting to /dashboard");
            router.push("/dashboard");
        } else {
             console.warn("[Login Page] signIn result was not 'ok' and not an 'error'. Result:", result);
        }
    });
  }

  return (
    <div className="flex sm:items-center sm:justify-center min-h-screen bg-primary sm:p-4">
      <Card className="w-full h-screen sm:h-auto sm:w-full sm:max-w-sm border-0 sm:border sm:rounded-lg">
        <CardHeader className="space-y-4 pt-16 sm:pt-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                Invalid email or password. Please try again.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline text-primary"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} required disabled={isPending} />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full font-bold mt-4" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>
            <Button variant="outline" className="w-full" type="button" disabled={isPending}>
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
           <div className="mt-6 text-center text-xs">
            <Link href="/admin/dashboard" className="underline text-muted-foreground hover:text-primary">
              Admin Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
