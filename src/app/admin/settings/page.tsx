
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function AdminSettingsPage() {
    const { toast } = useToast()

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your admin preferences have been updated.",
        })
    }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Admin Settings</h1>
        <p className="text-muted-foreground">Manage your admin panel preferences.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Admin Notifications</CardTitle>
            <CardDescription>Manage how you receive important system notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">New User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive an email when a new user signs up on the platform.
                    </p>
                </div>
                <Switch defaultChecked />
            </div>
             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Large Bet Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                       Receive an email when a bet over 1,000,000 MWK is placed.
                    </p>
                </div>
                <Switch />
            </div>
             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Large Deposit Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                       Receive emails when a deposit over 500,000 MWK is made.
                    </p>
                </div>
                <Switch defaultChecked />
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  )
}
