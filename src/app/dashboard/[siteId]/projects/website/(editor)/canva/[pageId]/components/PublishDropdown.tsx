"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ExternalLink, Globe, Save, Lock, Shield, Terminal, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"
import { BitmapChevron } from "@/app/(home)/components/bitmap-chevron"

interface PublishDropdownProps {
    pageStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    setPageStatus: (status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => void
    pageSlug?: string
    pageName?: string
    siteUrl?: string
    subdomain?: string
    seoScore?: number
    onSave: () => void
    isSaving: boolean
}

export function PublishDropdown({
    pageStatus,
    setPageStatus,
    pageSlug = "",
    pageName = "",
    siteUrl,
    subdomain,
    seoScore = 0,
    onSave,
    isSaving,
}: PublishDropdownProps) {

    // Slugify logic
    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')
    }

    const displaySlug = slugify(pageName) || pageSlug || "home"

    // Industrial SEO colors (Monochrome/Warning)
    // Updated for visibility: Explicit explicit bar colors, no opacity tricks
    const getSEOInfo = (score: number) => {
        if (score >= 80) return {
            color: "text-emerald-500",
            border: "border-emerald-500/20",
            bg: "bg-emerald-500/10",
            bar: "bg-emerald-500",
            label: "OPTIMAL"
        }
        if (score >= 50) return {
            color: "text-amber-500",
            border: "border-amber-500/20",
            bg: "bg-amber-500/10",
            bar: "bg-amber-500",
            label: "ACCEPTABLE"
        }
        return {
            color: "text-rose-500",
            border: "border-rose-500/20",
            bg: "bg-rose-500/10",
            bar: "bg-rose-500",
            label: "CRITICAL"
        }
    }

    const seoInfo = getSEOInfo(seoScore)
    const isPublished = pageStatus === "PUBLISHED"

    // URL Logic
    const getPageUrl = () => {
        const isLocalhost = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

        let baseUrl: string
        if (isLocalhost) {
            const localhostDomain = subdomain ? `${subdomain}.localhost:3000` : 'localhost:3000'
            baseUrl = `http://${localhostDomain}`
        } else {
            const domain = subdomain ? `${subdomain}.meindesk.gr` : (siteUrl || 'your-site.meindesk.gr')
            baseUrl = `https://${domain}`
        }

        if (displaySlug === "home" || displaySlug === "") return baseUrl
        if (displaySlug === "articles") return `${baseUrl}/articles`
        return `${baseUrl}/${displaySlug}`
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
                    className="gap-2"
                >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? "Saving..." : "Publish"}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 p-0 overflow-hidden bg-black border border-white/10 rounded-none shadow-2xl"
            >
                <div className="p-5 space-y-6">
                    {/* Header: Access Protocol */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Access Protocol
                            </span>
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 border text-[9px] font-mono uppercase tracking-widest",
                                isPublished ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-zinc-800 text-zinc-500"
                            )}>
                                <div className={cn("w-1 h-1 rounded-full", isPublished ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
                                {isPublished ? "Public" : "Restricted"}
                            </div>
                        </div>

                        <Tabs
                            value={pageStatus}
                            onValueChange={(v) => setPageStatus(v as any)}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 p-1 h-10 border border-white/10 rounded-none">
                                <TabsTrigger
                                    value="DRAFT"
                                    className="rounded-none text-[10px] font-mono uppercase tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all"
                                >
                                    DRAFT
                                </TabsTrigger>
                                <TabsTrigger
                                    value="PUBLISHED"
                                    className="rounded-none text-[10px] font-mono uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all"
                                >
                                    PUBLISHED
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* SEO Matrix */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                SEO Integrity
                            </span>
                            <span className={cn("font-mono text-[10px] uppercase tracking-widest", seoInfo.color)}>
                                {seoInfo.label}
                            </span>
                        </div>

                        <div className="h-1.5 w-full bg-zinc-900 border border-white/5">
                            <div
                                className={cn("h-full transition-all duration-700", seoInfo.bar)}
                                style={{ width: `${seoScore}%` }}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Target Node (URL) */}
                    <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Terminal className="h-3 w-3" />
                            DOMAIN
                        </span>
                        <div className="relative group/url border border-white/10 bg-zinc-900/30 p-2 hover:border-white/20 transition-colors">
                            <a
                                href={pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block font-mono text-[10px] text-zinc-400 truncate hover:text-white transition-colors"
                            >
                                <span className="text-zinc-700 mr-2">://</span>{pageUrl}
                            </a>
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/20" />
                            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/20" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={handleVisit}
                            className="group flex items-center justify-center gap-2 border border-white/10 px-4 py-2 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                        >
                            <BitmapChevron className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 group-hover:text-white">
                                Visit
                            </span>
                        </button>

                        <button
                            onClick={() => onSave()}
                            disabled={isSaving}
                            className="group flex items-center justify-center gap-2 bg-white text-black border border-white px-4 py-2 hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50"
                        >
                            <ScrambleTextOnHover
                                text={isSaving ? "SYNCING" : (pageStatus === "PUBLISHED" ? "PUBLISH" : "SAVE DRAFT")}
                                as="span"
                                className="font-mono text-[9px] uppercase tracking-widest font-bold"
                            />
                        </button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
