
import { SettingsClient } from "@/components/settings-client";
import { getCurrentUser } from "@/lib/data";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await getSession();
    if (!session?.user?.id) {
        redirect("/");
    }
    const user = await getCurrentUser();

    return <SettingsClient user={user} />
}
