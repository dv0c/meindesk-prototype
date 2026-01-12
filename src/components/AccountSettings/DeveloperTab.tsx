
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
import axios from "axios"
import { useRouter } from "next/navigation"

export function DeveloperTab() {
    const { data: session, update } = useSession()
    // @ts-ignore
    const [isEnabled, setIsEnabled] = useState(session?.user?.developerMode || false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await axios.put("/api/user/settings", {
                developerMode: isEnabled
            })

            await update() // Update session
            toast.success("Developer settings updated")
            router.refresh()
        } catch (error) {
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
                        Enable developer tools such as raw HTML export in the website builder.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label htmlFor="dev-mode">Enable Developer Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                This will show additional options in the builder interface for exporting code.
                            </p>
                        </div>
                        <Switch
                            id="dev-mode"
                            checked={isEnabled}
                            onCheckedChange={setIsEnabled}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
