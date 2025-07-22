
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    const { toast } = useToast()

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated.",
        })
    }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <Label>Theme</Label>
                <RadioGroup defaultValue="system" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem value="light" id="light" className="peer sr-only" />
                        <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            Light
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                        <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            Dark
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="system" id="system" className="peer sr-only" />
                        <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            System
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications from us.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Bet Status Updates</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive an email when a bet you placed is settled (Won/Lost).
                    </p>
                </div>
                <Switch defaultChecked />
            </div>
             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Promotional Emails</Label>
                    <p className="text-sm text-muted-foreground">
                       Receive emails about promotions, new features, and platform news.
                    </p>
                </div>
                <Switch />
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  )
}
