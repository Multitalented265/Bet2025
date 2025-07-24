
import { ProfileClient } from "@/components/profile-client";
import { getUserById } from "@/lib/data";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ProfilePage() {
    const session = await getSession();
    // The layout protects this page, so we can assume session and user exist.
    // If not, redirecting is a safe fallback.
    if (!session?.user?.id) {
        return redirect("/");
    }

    const user = await getUserById(session.user.id);

    if (!user) {
        // This case would be rare, e.g., user deleted from DB
        return redirect("/");
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
