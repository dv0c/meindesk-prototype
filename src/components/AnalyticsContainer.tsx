"use client"

import { AnalyticsCards } from "@/components/AnalyticsCards"
import { AnalyticsCharts } from "@/components/AnalyticsChart"
import { AnalyticsLogs } from "@/components/AnalyticsLogs"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const RANGE_OPTIONS = [
    { label: "Yesterday", value: "yesterday" },
    { label: "Last Week", value: "lastWeek" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Last 3 Months", value: "last3Months" },
]

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
import { AnalyticsResetControl } from "@/components/AnalyticsResetControl"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function AnalyticsContainer({
    siteId,
    analyticsConnected = true,
    isGlobalAdmin = false,
}: {
    siteId: string
    analyticsConnected?: boolean
    isGlobalAdmin?: boolean
}) {
    const [range, setRange] = useState("lastMonth")
    const [copied, setCopied] = useState(false)
    const [verifying, setVerifying] = useState(false)

    // Helper to copy script to clipboard
    const copyToClipboard = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.meindesk.com'
        const scriptCode = `<script src="${origin}/tracker.js" defer></script>`
        navigator.clipboard.writeText(scriptCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Script copied to clipboard")
    }

    const handleVerify = async () => {
        setVerifying(true)
        try {
            const res = await verifyAnalyticsInstallation(siteId)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Analytics verified and enabled!")
                // Page will refresh due to revalidatePath in server action
                window.location.reload()
            }
        } catch (e) {
            toast.error("Verification failed")
        } finally {
            setVerifying(false)
        }
    }

    if (!analyticsConnected) {
        return (
            <div className="p-6">
                <div className="border rounded-xl bg-card text-card-foreground shadow-sm">
                    {/* Header */}
                    <div className="border-b px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Code2 className="h-4 w-4" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight">Analytics Implementation</h1>
                                <p className="text-sm text-muted-foreground">Connect your headless project</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/30">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Waiting for connection
                        </div>
                    </div>

                    <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
                        {/* Intro */}
                        <div className="space-y-2 text-center max-w-lg mx-auto">
                            <h2 className="text-2xl font-bold">Connect your application</h2>
                            <p className="text-muted-foreground">
                                Add the tracking script to your site's <code className="text-xs bg-muted px-1 rounded">&lt;head&gt;</code> to start collecting data.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Step 1 */}
                            <div className="relative group space-y-4 rounded-lg border p-6 bg-background/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                                    <h3 className="font-semibold">Add Script</h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute right-2 top-2">
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyToClipboard}>
                                            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                    <div className="rounded-md border bg-muted p-3 font-mono text-[10px] sm:text-xs overflow-x-auto text-muted-foreground">
                                        &lt;script src=&quot;{typeof window !== 'undefined' ? window.location.origin : 'https://api.meindesk.com'}/tracker.js&quot; defer&gt;&lt;/script&gt;
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        For Next.js, use <code className="bg-muted px-1 rounded">next/script</code> with strategy <code className="bg-muted px-1 rounded">afterInteractive</code>.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="space-y-4 rounded-lg border p-6 bg-background/50 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
                                        <h3 className="font-semibold">Verify</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        After deploying your public site, run this check. We fetch your production URL
                                        (from site settings → frontend.publicUrl or revalidate URL), not the Meindesk
                                        preview subdomain.
                                    </p>
                                </div>
                                <Button onClick={handleVerify} disabled={verifying} className="w-full" size="lg">
                                    {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {verifying ? "Checking..." : "Verify Connection"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {RANGE_OPTIONS.map((opt) => (
                        <Button
                            key={opt.value}
                            size="sm"
                            variant={range === opt.value ? "secondary" : "ghost"}
                            onClick={() => setRange(opt.value)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 h-9">
                            <Code2 className="h-4 w-4" />
                            Script
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tracking Script</DialogTitle>
                            <DialogDescription>
                                Add this script to any external page to track visitors.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2 rounded-md border bg-muted p-2 mt-2">
                            <code className="text-sm flex-1 font-mono break-all relative">
                                &lt;script src=&quot;{typeof window !== 'undefined' ? window.location.origin : '...'}/tracker.js&quot; defer&gt;&lt;/script&gt;
                            </code>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                    {isGlobalAdmin && <AnalyticsResetControl siteId={siteId} />}
                </div>
            </div>

            {/* Analytics Cards */}
            <AnalyticsCards siteId={siteId} />

            {/* Charts */}
            <AnalyticsCharts siteId={siteId} range={range} />

            {/* Event Logs */}
            <AnalyticsLogs siteId={siteId} range={range} />
        </div>
    )
}
