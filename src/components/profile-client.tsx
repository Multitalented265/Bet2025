
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTransition, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { handleProfileUpdate } from "@/actions/user"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { User } from "@/lib/data"

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email(),
})

type ProfileClientProps = {
    user: User | null;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition();

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
    },
  })

  useEffect(() => {
    if (user) {
        profileForm.reset({
            fullName: user.name,
            email: user.email,
        })
    }
  }, [user, profileForm]);

  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("email", values.email);
    
    startTransition(async () => {
      await handleProfileUpdate(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile details have been successfully updated.",
      });
    });
  }
  
  return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your full name and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <fieldset disabled={isPending || !user}>
                <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isPending || !user}>{isPending ? "Updating..." : "Update Profile"}</Button>
                </div>
              </fieldset>
            </form>
          </Form>
        </CardContent>
      </Card>
  )
}
