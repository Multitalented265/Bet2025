

import { ProfileClient } from "@/components/profile-client";
import { getCurrentUser } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getSession();
    if (!session?.user?.id) {
        redirect("/");
    }
    const user = await getCurrentUser();

    if (!user) {
         return <p>User not found.</p>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account details.
                </p>
            </div>
            <ProfileClient user={user} />
        </div>
    );
}
