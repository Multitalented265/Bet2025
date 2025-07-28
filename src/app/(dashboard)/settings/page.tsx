
import { SettingsClient } from "@/components/settings-client";
import { getUserById } from "@/lib/data";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await getSession();
    
    if (!session?.user?.id) {
        return redirect("/");
    }

    const user = await getUserById(session.user.id);

    if (!user) {
        return redirect("/");
    }

    return <SettingsClient user={user} />
}
