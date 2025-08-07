"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/utils";
import { Shield, Eye, EyeOff, Mail, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          toast({
            title: "Login Successful",
            description: "Welcome to the admin dashboard.",
          });
          router.push("/admin/dashboard");
          router.refresh();
        } else {
          const userFriendlyMessage = handleError(result.message || "Invalid credentials");
          toast({
            variant: "destructive",
            title: "Login Failed",
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
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordMessage(data.message);
        setForgotPasswordEmail('');
        toast({
          title: "Reset Email Sent",
          description: data.message,
        });
      } else {
        const userFriendlyMessage = handleError(data.message || 'Failed to send reset email');
        setForgotPasswordMessage(userFriendlyMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: userFriendlyMessage,
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const userFriendlyMessage = handleError(error as Error);
      setForgotPasswordMessage(userFriendlyMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: userFriendlyMessage,
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            {...form.register("email")}
            className="w-full"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...form.register("password")}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            "Signing in..."
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Sign in to Admin
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm text-muted-foreground hover:text-primary"
          onClick={() => setShowForgotPassword(!showForgotPassword)}
        >
          Forgot your password?
        </Button>
      </div>

      {showForgotPassword && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your admin email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                disabled={forgotPasswordLoading}
              />
            </div>
            
            {forgotPasswordMessage && (
              <Alert variant={forgotPasswordMessage.includes('error') ? "destructive" : "default"}>
                <AlertDescription>{forgotPasswordMessage}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={forgotPasswordLoading}
              size="sm"
            >
              {forgotPasswordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Email
                </>
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
} 