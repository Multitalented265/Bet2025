

import { ProfileClient } from "@/components/profile-client";
import { getCurrentUser } from "@/lib/data";

export default async function ProfilePage() {
    const user = await getCurrentUser();

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
