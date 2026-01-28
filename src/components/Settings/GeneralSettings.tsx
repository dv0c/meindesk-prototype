"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Site } from "@prisma/client"
import { cn } from "@/lib/utils"

interface GeneralSettingsProps {
    site: Site
}

export function GeneralSettings({ site }: GeneralSettingsProps) {
    const router = useRouter()
    const [name, setName] = useState(site.title)
    const [isNameLoading, setNameLoading] = useState(false)
    const [nameError, setNameError] = useState("")

    const handleNameSubmit = async () => {
        setNameError("")
        setNameLoading(true)

        try {
            await axios.put(`/api/team/${site.id}`, {
                title: name,
                description: site.description,
                link: site.url,
                siteId: site.id,
            })
            toast.success("Project name updated")
            router.refresh()
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to update project name"
            setNameError(message)
            toast.error(message)
        } finally {
            setNameLoading(false)
        }
    }

    const SettingCard = ({ title, description, children, footer, className }: any) => (
        <div className={cn("rounded-lg border border-border bg-background overflow-hidden", className)}>
            <div className="p-6">
                <h3 className="text-lg font-medium leading-none tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                    {description}
                </p>
                {children}
            </div>
            {footer && (
                <div className="flex items-center justify-between p-4 px-6 bg-muted/20 border-t border-border">
                    {footer}
                </div>
            )}
        </div>
    )

    return (
        <div className="flex flex-col gap-6">
            <SettingCard
                title="Project Name"
                description="This is the name of your project on Vercel. It will be visible on your dashboard."
                footer={
                    <Button onClick={handleNameSubmit} disabled={isNameLoading || name === site.title} size="sm">
                        {isNameLoading ? "Saving..." : "Save"}
                    </Button>
                }
            >
                <div className="max-w-md">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="max-w-md"
                    />
                    {nameError && <p className="text-sm text-destructive mt-2">{nameError}</p>}
                </div>
            </SettingCard>
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900 overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-medium leading-none tracking-tight mb-2 text-red-600 dark:text-red-400">Project ID</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                        Used when interacting with the API.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                            {site.id}
                        </code>
                    </div>
                </div>
            </div>
        </div>
    )
}
