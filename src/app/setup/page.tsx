"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const { toast } = useToast();

  const checkAdminStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/setup-admin");
      const data = await response.json();
      setAdminStatus(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check admin status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        setAdminStatus(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create admin account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
            <CardDescription>
              Set up the admin account for the betting platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                onClick={checkAdminStatus}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Checking..." : "Check Admin Status"}
              </Button>
              
              {adminStatus && (
                <div className="mt-4 p-4 rounded-lg border">
                  {adminStatus.success ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Admin account exists
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Admin account not found
                      </span>
                    </div>
                  )}
                  
                  {adminStatus.admin && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Email: {adminStatus.admin.email}</p>
                      <p>Name: {adminStatus.admin.name}</p>
                      {adminStatus.admin.password && (
                        <p className="text-orange-600 font-medium">
                          Password: {adminStatus.admin.password}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {adminStatus && !adminStatus.success && (
                <Button
                  onClick={createAdmin}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? "Creating..." : "Create Admin Account"}
                </Button>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              <p>Default admin credentials:</p>
              <p>Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL}</p>
              <p>Password: {process.env.NEXT_PUBLIC_ADMIN_PASSWORD}</p>
              <p className="mt-2 text-orange-600">
                ⚠️ Change the password in production!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 