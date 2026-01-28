"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2, Globe, CheckCircle2, AlertCircle, Settings } from "lucide-react"
import type { Site } from "@prisma/client"
import { cn } from "@/lib/utils"

interface DomainsSettingsProps {
    site: Site
}

export function DomainsSettings({ site }: DomainsSettingsProps) {
    const router = useRouter()
    const [domainStatus, setDomainStatus] = useState<any>(null)
    const [domainVerificationLoading, setDomainVerificationLoading] = useState(false)

    // --- Check Domain Status on Mount/Change ---
    useEffect(() => {
        if (site.url && !site.url.includes(".meindesk.gr") && !site.url.includes("localhost")) {
            checkDomainStatus(site.url)
        }
    }, [site.url])

    const checkDomainStatus = async (domain: string) => {
        setDomainVerificationLoading(true)
        try {
            const res = await axios.get(`/api/site/${site.id}/domains?domain=${domain}`)
            setDomainStatus(res.data)
        } catch (error) {
            console.error("Failed to check domain", error)
        } finally {
            setDomainVerificationLoading(false)
        }
    }

    const handleRemoveDomain = async (domainToRemove: string) => {
        if (!confirm("Are you sure you want to remove this domain?")) return

        try {
            await axios.delete(`/api/site/${site.id}/domains?domain=${domainToRemove}`)
            toast.success("Domain removed")
            setDomainStatus(null)
            router.refresh()
        } catch (error) {
            toast.error("Failed to remove domain")
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

    const isCustomDomain = site.url && !site.url.includes(".meindesk.gr");

    return (
        <SettingCard
            title="Domains"
            description="These are the domains associated with your project."
            className="overflow-hidden"
            footer={
                <div className="flex w-full justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                        Looking to add a subdomain? <Link href="/resources/documentation/subdomains" className="underline cursor-pointer hover:text-foreground">Read the docs</Link>.
                    </span>
                    <Button onClick={() => router.push(`/dashboard/${site.id}/domain-setup`)} size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Domain Setup
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Default Subdomain */}
                <div className="border rounded-md p-4 flex items-center justify-between bg-card">
                    <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <div className="font-medium text-sm">{site.subdomain}.meindesk.gr</div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs font-normal">Default Subdomain</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Domain Item */}
                {isCustomDomain && (
                    <div className="border rounded-md divide-y">
                        <div className="p-4 flex items-center justify-between bg-card">
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium text-sm">{site.url}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {domainVerificationLoading ? (
                                            <Badge variant="outline" className="text-xs font-normal">Checking...</Badge>
                                        ) : domainStatus?.verified ? (
                                            <div className="flex items-center gap-1.5 text-xs text-blue-500">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Valid Configuration
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                                <AlertCircle className="w-3 h-3" />
                                                Invalid Configuration
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => checkDomainStatus(site.url!)} disabled={domainVerificationLoading}>
                                    <RefreshCw className={cn("w-4 h-4", domainVerificationLoading && "animate-spin")} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveDomain(site.url!)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Config Instructions if Invalid */}
                        {!domainStatus?.verified && !domainVerificationLoading && domainStatus && (
                            <div className="p-4 bg-muted/30 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Set the following record on your DNS provider to continue:</span>
                                </div>
                                <div className="grid gap-2 text-sm">
                                    <div className="grid grid-cols-[100px_1fr] md:grid-cols-[100px_200px_auto] gap-2 items-center bg-background border p-2 rounded">
                                        <span className="font-medium text-muted-foreground pl-2">Type</span>
                                        <span className="font-mono">A</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] md:grid-cols-[100px_200px_auto] gap-2 items-center bg-background border p-2 rounded">
                                        <span className="font-medium text-muted-foreground pl-2">Name</span>
                                        <span className="font-mono">@</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] md:grid-cols-[100px_200px_auto] gap-2 items-center bg-background border p-2 rounded">
                                        <span className="font-medium text-muted-foreground pl-2">Value</span>
                                        <span className="font-mono">76.76.21.21</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SettingCard>
    )
}
