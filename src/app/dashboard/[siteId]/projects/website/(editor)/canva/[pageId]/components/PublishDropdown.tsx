"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ExternalLink, Globe, Save, Sparkles, TrendingUp } from "lucide-react"

interface PublishDropdownProps {
    pageStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    pageSlug?: string
    siteUrl?: string
    subdomain?: string
    seoScore?: number
    onSave: () => void
    isSaving: boolean
}

export function PublishDropdown({
    pageStatus,
    pageSlug = "",
    siteUrl,
    subdomain,
    seoScore = 0,
    onSave,
    isSaving,
}: PublishDropdownProps) {
    // Calculate SEO score color and label
    const getSEOInfo = (score: number) => {
        if (score >= 80) return {
            gradient: "from-green-500 to-emerald-500",
            label: "Excellent",
            badgeClass: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
        }
        if (score >= 50) return {
            gradient: "from-amber-500 to-orange-500",
            label: "Good",
            badgeClass: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
        }
        return {
            gradient: "from-red-500 to-rose-500",
            label: "Needs Work",
            badgeClass: "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0"
        }
    }

    const seoInfo = getSEOInfo(seoScore)
    const isPublished = pageStatus === "PUBLISHED"

    // Construct the proper URL based on page slug
    const getPageUrl = () => {
        // Detect if we're in development (localhost)
        const isLocalhost = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

        let baseUrl: string

        if (isLocalhost) {
            // Use subdomain.localhost for development
            const localhostDomain = subdomain ? `${subdomain}.localhost:3000` : 'localhost:3000'
            baseUrl = `http://${localhostDomain}`
        } else {
            // Use production domain
            const domain = subdomain ? `${subdomain}.meindesk.gr` : (siteUrl || 'your-site.meindesk.gr')
            baseUrl = `https://${domain}`
        }

        if (pageSlug === "home" || pageSlug === "") return baseUrl
        if (pageSlug === "articles") return `${baseUrl}/articles`
        if (pageSlug === "article") return `${baseUrl}/articles`
        return `${baseUrl}/${pageSlug}`
    }

    const pageUrl = getPageUrl()

    const handleVisit = () => {
        window.open(pageUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="sm"
                    disabled={isSaving}
                    className="gap-1.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-sm"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Publish"}
                    <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
                {/* SEO Score Section */}
                <div className="px-4 py-4 bg-background to-muted/20">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold mb-0.5">SEO Performance</h4>
                                    <p className="text-xs text-muted-foreground">Search optimization score</p>
                                </div>
                            </div>
                            <Badge className={seoInfo.badgeClass}>
                                {seoInfo.label}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full bg-gradient-to-r ${seoInfo.gradient} transition-all duration-700 ease-out`}
                                        style={{ width: `${seoScore}%` }}
                                    />
                                </div>
                                <span className="text-base font-bold text-foreground w-12 text-right tabular-nums">
                                    {seoScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator className="m-0" />

                {/* Status Section */}
                <div className="px-4 py-4 bg-background">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className={`w-3 h-3 rounded-full ${isPublished ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                                {isPublished && (
                                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-0.5">
                                    {isPublished ? "Live & Published" : "Draft Mode"}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {isPublished ? "Visible to all visitors" : "Private preview only"}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={isPublished ? "default" : "secondary"}
                            className={
                                isPublished
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white shadow-sm"
                                    : "bg-muted"
                            }
                        >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {isPublished ? "Online" : "Offline"}
                        </Badge>
                    </div>
                </div>

                <DropdownMenuSeparator className="m-0" />

                {/* Domain Section */}
                <div className="px-4 py-4 bg-background">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                            <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold mb-1">Page Address</h4>
                            <a
                                href={pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80 truncate block transition-colors"
                                title={pageUrl}
                            >
                                {pageUrl}
                            </a>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator className="m-0" />

                {/* Actions */}
                <div className="p-3 space-y-2 bg-gradient-to-br from-background to-background/90">
                    <button
                        onClick={handleVisit}
                        className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg bg-background hover:bg-primary/5 border border-border hover:border-primary/20 transition-all duration-200 cursor-pointer"
                    >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                            <ExternalLink className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium">Visit Live Page</p>
                            <p className="text-xs text-muted-foreground">Open in new tab</p>
                        </div>
                    </button>

                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <div className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center">
                            <Save className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold">{isSaving ? "Saving..." : "Save Changes"}</p>
                            <p className="text-xs opacity-90">Update your page</p>
                        </div>
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
