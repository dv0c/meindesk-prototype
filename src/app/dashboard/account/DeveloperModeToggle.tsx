"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { toggleDeveloperMode } from "@/lib/actions/user-actions"
import { Loader2 } from "lucide-react"

export function DeveloperModeToggle({ initialValue }: { initialValue: boolean }) {
    const [enabled, setEnabled] = useState(initialValue)
    const [loading, setLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setEnabled(checked)
        setLoading(true)
        try {
            await toggleDeveloperMode(checked)
            toast.success(checked ? "Developer mode enabled" : "Developer mode disabled")
        } catch (error) {
            setEnabled(!checked) // Revert
            toast.error("Failed to update setting")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
                <Label htmlFor="developer-mode" className="text-base font-medium">Developer Mode</Label>
                <div className="text-sm text-muted-foreground">
                    Unlock developer tools, API keys, and advanced project settings.
                    {loading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                </div>
            </div>
            <Switch
                id="developer-mode"
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={loading}
            />
        </div>
    )
}
