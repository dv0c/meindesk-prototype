"use client"

import { AnalyticsCards } from "@/components/AnalyticsCards"
import { AnalyticsCharts } from "@/components/AnalyticsChart"
import { AnalyticsLogs } from "@/components/AnalyticsLogs"
import { Button } from "@/components/ui/button"
import SiteContainer from "@/components/SiteContainer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Code2, Copy, Check } from "lucide-react"
import { verifyAnalyticsInstallation } from "@/lib/actions/site/verify-analytics"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AnalyticsFilterProvider, useAnalyticsFilters } from "@/components/analytics/AnalyticsFilterProvider"
import { AnalyticsFilterBar } from "@/components/analytics/AnalyticsFilterBar"
import { AnalyticsContentTab } from "@/components/analytics/AnalyticsContentTab"
import { AnalyticsSearchTab } from "@/components/analytics/AnalyticsSearchTab"
import { AnalyticsBehaviorTab } from "@/components/analytics/AnalyticsBehaviorTab"
import { AnalyticsRetentionTab } from "@/components/analytics/AnalyticsRetentionTab"

function AnalyticsDashboard({
    siteId,
    isGlobalAdmin = false,
}: {
    siteId: string
    isGlobalAdmin?: boolean
}) {
    const { filters } = useAnalyticsFilters()
    const range = filters.preset ?? "last30Days"
    const [copied, setCopied] = useState(false)
    const [resetOpen, setResetOpen] = useState(false)

    const copyToClipboard = () => {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://www.meindesk.gr"
        navigator.clipboard.writeText(`<script src="${origin}/tracker.js" defer></script>`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Script copied to clipboard")
    }

    const handleExport = () => {
        const params = new URLSearchParams({ report: "overview" })
        if (filters.preset) params.set("preset", filters.preset)
        window.open(`/api/analytics/${siteId}/export?${params}`, "_blank")
    }

    return (
        <SiteContainer className="flex flex-1 flex-col gap-4 p-5">
            <AnalyticsFilterBar siteId={siteId} onExport={handleExport} />

            <div className="flex items-center justify-end gap-2">
                {isGlobalAdmin && (
                    <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                                Reset Data
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reset Analytics Data?</DialogTitle>
                                <DialogDescription>
                                    Permanently delete all analytics events, sessions, and rollups for this site.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
                                <Button
                                    variant="destructive"
                                    onClick={async () => {
                                        const res = await fetch(`/api/analytics/${siteId}/reset`, { method: "DELETE" })
                                        if (res.ok) {
                                            toast.success("Analytics reset")
                                            window.location.reload()
                                        } else {
                                            toast.error("Failed to reset — admin access required")
                                        }
                                    }}
                                >
                                    Confirm Reset
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Code2 className="h-4 w-4" />
                            Script
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tracking Script</DialogTitle>
                            <DialogDescription>Add this to your site&apos;s head tag.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2 rounded-md border bg-muted p-2 mt-2">
                            <code className="text-sm flex-1 font-mono break-all">
                                &lt;script src=&quot;{typeof window !== "undefined" ? window.location.origin : "..."}/tracker.js&quot; defer&gt;&lt;/script&gt;
                            </code>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                    <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    <TabsTrigger value="retention">Retention</TabsTrigger>
                    <TabsTrigger value="live">Live</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <AnalyticsCards siteId={siteId} />
                    <AnalyticsCharts siteId={siteId} />
                </TabsContent>
                <TabsContent value="content">
                    <AnalyticsContentTab siteId={siteId} />
                </TabsContent>
                <TabsContent value="search">
                    <AnalyticsSearchTab siteId={siteId} />
                </TabsContent>
                <TabsContent value="behavior">
                    <AnalyticsBehaviorTab siteId={siteId} />
                </TabsContent>
                <TabsContent value="retention">
                    <AnalyticsRetentionTab siteId={siteId} />
                </TabsContent>
                <TabsContent value="live">
                    <AnalyticsLogs siteId={siteId} range={range} />
                </TabsContent>
            </Tabs>
        </SiteContainer>
    )
}

export function AnalyticsContainer({
    siteId,
    analyticsConnected = true,
    isGlobalAdmin = false,
}: {
    siteId: string
    analyticsConnected?: boolean
    isGlobalAdmin?: boolean
}) {
    const [verifying, setVerifying] = useState(false)

    const handleVerify = async () => {
        setVerifying(true)
        try {
            const res = await verifyAnalyticsInstallation(siteId)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Analytics verified!")
                window.location.reload()
            }
        } catch {
            toast.error("Verification failed")
        } finally {
            setVerifying(false)
        }
    }

    if (!analyticsConnected) {
        return (
            <div className="p-6">
                <div className="border rounded-xl bg-card p-8 max-w-2xl mx-auto space-y-4 text-center">
                    <h1 className="text-lg font-semibold">Connect Analytics</h1>
                    <p className="text-sm text-muted-foreground">Add the tracking script to your public site, then verify.</p>
                    <Button onClick={handleVerify} disabled={verifying}>
                        {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Verify Connection
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <AnalyticsFilterProvider>
            <AnalyticsDashboard siteId={siteId} isGlobalAdmin={isGlobalAdmin} />
        </AnalyticsFilterProvider>
    )
}
