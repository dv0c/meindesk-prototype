"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toggleDeveloperMode } from "@/lib/actions/user-actions"
import { Loader2 } from "lucide-react"

export function DeveloperTab() {
    const { data: session, update } = useSession()
    // @ts-ignore
    const [isEnabled, setIsEnabled] = useState(session?.user?.developerMode || false)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setIsEnabled(checked)
        setIsLoading(true)
        try {
            await toggleDeveloperMode(checked)
            await update() // Update session
            toast.success(checked ? "Developer mode enabled" : "Developer mode disabled")
        } catch (error) {
            setIsEnabled(!checked) // Revert
            toast.error("Failed to update settings")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Developer Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Configure advanced developer tools and options.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Developer Mode</CardTitle>
                    <CardDescription>
                        Unlock advanced features, API keys, and raw data access across the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label htmlFor="dev-mode">Enable Developer Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                This will enable the "Developer" tab in project settings and allow access to raw API endpoints.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            <Switch
                                id="dev-mode"
                                checked={isEnabled}
                                onCheckedChange={handleToggle}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
