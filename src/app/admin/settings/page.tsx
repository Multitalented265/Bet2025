
"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Shield, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { handleError } from "@/lib/utils"
import { handleAdminPasswordChange, handleAdminEmailChange, handleAdminNotificationSettings, fetchAdminSettings } from "@/actions/admin"
import { Admin2FASetup } from "@/components/admin-2fa-setup"
import type { AdminSettings } from "@/lib/data"

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
})

const emailFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newEmail: z.string().email({ message: "Please enter a valid email address." }),
})

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showEmailCurrentPassword, setShowEmailCurrentPassword] = useState(false)
    const [settings, setSettings] = useState<AdminSettings | null>(null);
    const [show2FASetup, setShow2FASetup] = useState(false)
    const [twoFAData, setTwoFAData] = useState<{
        qrCodeUrl: string;
        secret: string;
        backupCodes: string[];
    } | null>(null)

    const fetchSettings = async () => {
      try {
        const adminSettings = await fetchAdminSettings();
        setSettings(adminSettings);
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        const userFriendlyMessage = handleError(error as Error);
        toast({
          variant: "destructive",
          title: "Error",
          description: userFriendlyMessage,
        });
      }
    };

    useEffect(() => {
      fetchSettings();
    }, [toast]);

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const emailForm = useForm<z.infer<typeof emailFormSchema>>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
            currentPassword: "",
            newEmail: "",
        },
    })

    function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        startTransition(async () => {
            try {
                await handleAdminPasswordChange(values);
                toast({
                    title: "Password Updated",
                    description: "Your password has been changed successfully.",
                });
                passwordForm.reset();
            } catch (error) {
                console.error('Error updating password:', error);
                const userFriendlyMessage = handleError(error as Error);
                toast({
                    title: "Error",
                    description: userFriendlyMessage,
                    variant: "destructive"
                });
            }
        });
    }

    function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
        startTransition(async () => {
            try {
                await handleAdminEmailChange(values);
                toast({
                    title: "Email Updated",
                    description: "Your email has been changed successfully.",
                });
                emailForm.reset();
            } catch (error) {
                console.error('Error updating email:', error);
                const userFriendlyMessage = handleError(error as Error);
                toast({
                    title: "Error",
                    description: userFriendlyMessage,
                    variant: "destructive"
                });
            }
        });
    }

    const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("enable-2fa", settings?.enable2fa ? "on" : "off");
        formData.append("newUser", settings?.notifyOnNewUser ? "on" : "off");
        formData.append("newUserLogin", settings?.notifyOnNewUserLogin ? "on" : "off");
        formData.append("largeBet", settings?.notifyOnLargeBet ? "on" : "off");
        formData.append("largeDeposit", settings?.notifyOnLargeDeposit ? "on" : "off");
        formData.append("maintenanceMode", settings?.maintenanceMode ? "on" : "off");
        startTransition(async () => {
            try {
                await handleAdminNotificationSettings(formData);
                toast({
                    title: "Settings Saved",
                    description: "Your admin preferences have been updated.",
                });
            } catch (error) {
                console.error('Error saving settings:', error);
                const userFriendlyMessage = handleError(error as Error);
                toast({
                    title: "Error",
                    description: userFriendlyMessage,
                    variant: "destructive"
                });
            }
        });
    }

    const handle2FASetup = async () => {
        try {
            const response = await fetch('/api/admin/setup-2fa', {
                method: 'GET',
            });
            
            const result = await response.json();
            
            if (result.success) {
                setTwoFAData({
                    qrCodeUrl: result.qrCodeUrl,
                    secret: result.secret,
                    backupCodes: result.backupCodes
                });
                setShow2FASetup(true);
            } else {
                toast({
                    variant: "destructive",
                    title: "Setup Failed",
                    description: result.error || "Failed to setup 2FA",
                });
            }
        } catch (error) {
            const userFriendlyMessage = handleError(error as Error);
            toast({
                variant: "destructive",
                title: "Setup Error",
                description: userFriendlyMessage,
            });
        }
    };

    const handle2FAComplete = () => {
        setShow2FASetup(false);
        setTwoFAData(null);
        // Refresh settings
        fetchSettings();
    };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Admin Settings</h1>
        <p className="text-muted-foreground">Manage your admin panel preferences and security.</p>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
                Choose a new, strong password for your admin account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                     <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showCurrentPassword ? "text" : "password"} {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                               <div className="relative">
                                <Input type={showNewPassword ? "text" : "password"} {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                               <div className="relative">
                                <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isPending}>{isPending ? "Changing..." : "Change Password"}</Button>
                    </div>
                </form>
            </Form>
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle>Change Email</CardTitle>
            <CardDescription>
                Update your admin email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                     <FormField
                        control={emailForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showEmailCurrentPassword ? "text" : "password"} {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                  onClick={() => setShowEmailCurrentPassword(!showEmailCurrentPassword)}
                                >
                                  {showEmailCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="admin@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isPending}>{isPending ? "Changing..." : "Change Email"}</Button>
                    </div>
                </form>
            </Form>
          </CardContent>
      </Card>
        <form onSubmit={handleSaveSettings}>
          <fieldset disabled={isPending || !settings}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {settings?.enable2fa ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <Shield className="h-5 w-5" />}
                        Two-Factor Authentication (2FA)
                    </CardTitle>
                    <CardDescription>
                        {settings?.enable2fa 
                            ? "2FA is currently enabled. You can disable it below."
                            : "Add an extra layer of security to your account."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="enable-2fa" className="text-base">Enable 2FA</Label>
                            <p className="text-sm text-muted-foreground">
                                When enabled, you will be required to enter a code from your authenticator app to log in.
                            </p>
                        </div>
                        <Switch 
                          id="enable-2fa" 
                          name="enable-2fa" 
                          checked={settings?.enable2fa}
                          onCheckedChange={(checked) => setSettings(s => s ? {...s, enable2fa: checked} : null)}
                        />
                    </div>
                    
                    {!settings?.enable2fa && (
                        <div className="flex justify-end">
                            <Button 
                                type="button" 
                                onClick={handle2FASetup}
                                className="flex items-center gap-2"
                            >
                                <Shield className="h-4 w-4" />
                                Setup 2FA
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Admin Notifications & System</CardTitle>
                    <CardDescription>Manage notifications and platform status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="maintenance-mode" className="text-base">Maintenance Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                When enabled, users see a maintenance page. Admin and webhooks remain accessible.
                            </p>
                        </div>
                        <Switch 
                          id="maintenance-mode" 
                          name="maintenanceMode" 
                          checked={settings?.maintenanceMode}
                          onCheckedChange={async (checked) => {
                            setSettings(s => s ? {...s, maintenanceMode: checked} : null);
                            
                            // Immediately save to database
                            try {
                              const response = await fetch('/api/admin/maintenance', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ enabled: checked })
                              });
                              
                              if (response.ok) {
                                toast({
                                  title: checked ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
                                  description: checked 
                                    ? "Users will now see the maintenance page." 
                                    : "Users can now access the site normally.",
                                });
                              } else {
                                throw new Error('Failed to update maintenance mode');
                              }
                            } catch (error) {
                              // Revert the UI state on error
                              setSettings(s => s ? {...s, maintenanceMode: !checked} : null);
                              const userFriendlyMessage = handleError(error as Error);
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: userFriendlyMessage,
                              });
                            }
                          }}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="new-user-notification" className="text-base">New User Registration</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive an email when a new user signs up on the platform.
                            </p>
                        </div>
                        <Switch 
                          id="new-user-notification" 
                          name="newUser" 
                          checked={settings?.notifyOnNewUser}
                          onCheckedChange={(checked) => setSettings(s => s ? {...s, notifyOnNewUser: checked} : null)}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="new-user-login-notification" className="text-base">New User Login</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive an email when a new user logs in for the first time.
                            </p>
                        </div>
                        <Switch 
                          id="new-user-login-notification" 
                          name="newUserLogin" 
                          checked={settings?.notifyOnNewUserLogin}
                          onCheckedChange={(checked) => setSettings(s => s ? {...s, notifyOnNewUserLogin: checked} : null)}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="large-bet-alert" className="text-base">Large Bet Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                            Receive an email when a bet over 1,000,000 MWK is placed.
                            </p>
                        </div>
                        <Switch 
                          id="large-bet-alert" 
                          name="largeBet" 
                          checked={settings?.notifyOnLargeBet}
                          onCheckedChange={(checked) => setSettings(s => s ? {...s, notifyOnLargeBet: checked} : null)}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="large-deposit-alert" className="text-base">Large Deposit Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                            Receive emails when a deposit over 500,000 MWK is made.
                            </p>
                        </div>
                        <Switch 
                          id="large-deposit-alert" 
                          name="largeDeposit" 
                          checked={settings?.notifyOnLargeDeposit}
                           onCheckedChange={(checked) => setSettings(s => s ? {...s, notifyOnLargeDeposit: checked} : null)}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isPending || !settings}>{isPending ? "Saving..." : "Save Changes"}</Button>
            </div>
          </fieldset>
        </form>

        {/* 2FA Setup Modal */}
        {show2FASetup && twoFAData && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Setup Two-Factor Authentication</h2>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShow2FASetup(false)}
                        >
                            ×
                        </Button>
                    </div>
                    <Admin2FASetup
                        qrCodeUrl={twoFAData.qrCodeUrl}
                        secret={twoFAData.secret}
                        backupCodes={twoFAData.backupCodes}
                        onSetupComplete={handle2FAComplete}
                    />
                </div>
            </div>
        )}
    </div>
  )
}
