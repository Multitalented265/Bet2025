"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Download, Copy, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { handleError } from "@/lib/utils"

const setup2FASchema = z.object({
  verificationCode: z.string().length(6, "Please enter the 6-digit verification code"),
})

type Setup2FAFormData = z.infer<typeof setup2FASchema>

type Admin2FASetupProps = {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
  onSetupComplete: () => void;
}

export function Admin2FASetup({ qrCodeUrl, secret, backupCodes, onSetupComplete }: Admin2FASetupProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showSecret, setShowSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  const form = useForm<Setup2FAFormData>({
    resolver: zodResolver(setup2FASchema),
    defaultValues: {
      verificationCode: "",
    },
  })

  const handleCopyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'))
      setCopiedCodes(true)
      toast({
        title: "Backup codes copied",
        description: "Backup codes have been copied to your clipboard.",
      })
      setTimeout(() => setCopiedCodes(false), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the backup codes manually.",
      })
    }
  }

  const handleDownloadBackupCodes = () => {
    const content = `Mzunguko Admin 2FA Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes safe in case you lose access to your authenticator app.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mzunguko-2fa-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const onSubmit = async (data: Setup2FAFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("secret", secret)
        formData.append("verificationCode", data.verificationCode)
        formData.append("backupCodes", JSON.stringify(backupCodes))

        const response = await fetch('/api/admin/setup-2fa', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          toast({
            title: "2FA Setup Complete",
            description: "Two-factor authentication has been enabled for your account.",
          })
          onSetupComplete()
        } else {
          toast({
            variant: "destructive",
            title: "Setup Failed",
            description: result.error || "Failed to setup 2FA. Please try again.",
          })
        }
      } catch (error) {
        const userFriendlyMessage = handleError(error as Error)
        toast({
          variant: "destructive",
          title: "Setup Error",
          description: userFriendlyMessage,
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          <strong>Important:</strong> Save your backup codes in a secure location. You'll need them if you lose access to your authenticator app.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Scan QR Code</CardTitle>
          <CardDescription>
            Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={qrCodeUrl} 
              alt="2FA QR Code" 
              className="border rounded-lg"
              width={200}
              height={200}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Manual Entry (if QR code doesn't work)</label>
            <div className="flex items-center gap-2">
              <Input 
                value={secret} 
                readOnly 
                type={showSecret ? "text" : "password"}
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Backup Codes</CardTitle>
          <CardDescription>
            Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
            {backupCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm text-center p-2 bg-background rounded border">
                {code}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyBackupCodes}
              className="flex items-center gap-2"
            >
              {copiedCodes ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedCodes ? "Copied!" : "Copy Codes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadBackupCodes}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 3: Verify Setup</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to complete the setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-lg font-mono tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Verifying..." : "Complete 2FA Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 