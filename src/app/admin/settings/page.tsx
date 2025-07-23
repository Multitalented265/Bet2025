
"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"

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
import { handleAdminPasswordChange, handleAdminNotificationSettings, getAdminSettings } from "@/actions/admin"
import type { AdminSettings } from "@/lib/data"

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
})

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [settings, setSettings] = useState<AdminSettings | null>(null);

    useEffect(() => {
      async function fetchSettings() {
        const adminSettings = await getAdminSettings();
        setSettings(adminSettings);
      }
      fetchSettings();
    }, []);

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        startTransition(async () => {
            await handleAdminPasswordChange(values);
            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
            });
            passwordForm.reset();
        });
    }

    const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            await handleAdminNotificationSettings(formData);
            toast({
                title: "Settings Saved",
                description: "Your admin preferences have been updated.",
            });
        });
    }

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
        <form onSubmit={handleSaveSettings}>
          <fieldset disabled={isPending || !settings}>
            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
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
                          defaultChecked={settings?.enable2fa}
                          key={settings?.id}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Admin Notifications</CardTitle>
                    <CardDescription>Manage how you receive important system notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                          defaultChecked={settings?.notifyOnNewUser}
                          key={`${settings?.id}-newUser`}
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
                          defaultChecked={settings?.notifyOnLargeBet}
                          key={`${settings?.id}-largeBet`}
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
                          defaultChecked={settings?.notifyOnLargeDeposit}
                          key={`${settings?.id}-largeDeposit`}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isPending || !settings}>{isPending ? "Saving..." : "Save Changes"}</Button>
            </div>
          </fieldset>
        </form>
    </div>
  )
}
