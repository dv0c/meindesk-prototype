import { UserSetupForm } from "@/components/auth/UserSetupForm";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SetupUserPage() {
    const session = await getAuthSession();

    if (!session?.user) {
        return redirect("/login");
    }

    // If user already has a username, they don't need to be here
    if (session.user.username) {
        return redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <UserSetupForm
                defaultName={session.user.name}
                defaultImage={session.user.image}
            />
        </div>
    );
}
