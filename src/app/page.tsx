
import Link from "next/link"

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

export default function LoginPage() {
  return (
    <div className="flex md:items-center md:justify-center min-h-screen bg-primary md:p-4">
      <Card className="w-full h-screen md:h-auto md:w-full md:max-w-sm border-0 md:border md:rounded-lg">
        <CardHeader className="space-y-4 pt-16 md:pt-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
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
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full font-bold" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </div>
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
