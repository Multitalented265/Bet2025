
import { SettingsClient } from "@/components/settings-client";
import { getUserById } from "@/lib/data";
import { redirect } from "next/navigation";
import { getSession } from "next-auth/react";

export default async function SettingsPage() {
    const session = await getSession();
    if (!session?.user?.id) {
        redirect("/");
    }
    const user = await getUserById(session.user.id);

     if (!user) {
        redirect("/");
    }

    return <SettingsClient user={user} />
}
