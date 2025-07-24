
import { SettingsClient } from "@/components/settings-client";
import { getUserById } from "@/lib/data";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect("/");
    }
    const user = await getUserById(session.user.id);

     if (!user) {
        redirect("/");
    }

    return <SettingsClient user={user} />
}
