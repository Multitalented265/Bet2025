import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SupportClient } from "@/components/support-client";

export default async function SupportPage() {
    const session = await getSession();
    
    // The layout protects this page, so we can assume session and user exist.
    // If not, redirecting is a safe fallback.
    if (!session?.user?.id) {
        return redirect("/");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Support Center</h1>
                <p className="text-muted-foreground">Get help with your account or find answers to common questions.</p>
            </div>
            <SupportClient user={session.user} />
        </div>
    );
}
