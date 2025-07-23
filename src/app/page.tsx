"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    startTransition(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.ok && !result.error) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect email or password.",
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
          <CardTitle className="text-2xl font-headline text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <fieldset disabled={isPending}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2 mt-4">
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
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} required />
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
              <Button type="submit" className="w-full font-bold mt-4">
                {isPending ? "Logging in..." : "Login"}
              </Button>
              <Button variant="outline" className="w-full">
                <GoogleIcon className="mr-2 h-4 w-4" />
                Login with Google
              </Button>
            </fieldset>
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