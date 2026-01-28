import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { global_blur } from "@/lib/utils"
import { DeveloperModeToggle } from "./DeveloperModeToggle"

export default async function AccountPage() {
    const session = await getAuthSession()
    if (!session) redirect("/login")

    return (
        <div className="flex flex-col space-y-8 p-10 max-w-5xl mx-auto w-full">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-8">
                <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${global_blur}`}>
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Profile</h3>
                        <p className="text-sm text-muted-foreground">
                            Your personal information.
                        </p>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
                                <div className="mt-1.5 p-2 border rounded-md bg-muted/50 text-sm">
                                    {session.user.name}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                <div className="mt-1.5 p-2 border rounded-md bg-muted/50 text-sm">
                                    {session.user.email}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${global_blur}`}>
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Developer Settings</h3>
                        <p className="text-sm text-muted-foreground">
                            Enable advanced features and API access.
                        </p>
                    </div>
                    <div className="p-6 pt-0">
                        {/* @ts-ignore */}
                        <DeveloperModeToggle initialValue={session.user.developerMode || false} />
                    </div>
                </div>
            </div>
        </div>
    )
}
