'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Rss, ExternalLink, Calendar, Trash2, Globe, FileText, MoreHorizontal, Pencil, Copy, Link2, Merge, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"

interface FeedTemplate {
    id: string
    name: string
    targetUrl: string
    containerSelector: string
    titleSelector: string | null
    linkSelector: string | null
    thumbnailSelector: string | null
    descriptionSelector: string | null
    dateSelector: string | null
    authorSelector: string | null
    createdAt: string
    updatedAt: string
}

interface MergedFeed {
    id: string
    name: string
    description: string | null
    sources: { type: string; value: string }[]
    filters: { include?: string[]; exclude?: string[] } | null
    createdAt: string
}

const RSSPage = ({ params }: { params: Promise<{ siteId: string }> }) => {
    const { siteId } = use(params)

    const [templates, setTemplates] = useState<FeedTemplate[]>([])
    const [mergedFeeds, setMergedFeeds] = useState<MergedFeed[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Fetch templates and merged feeds
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templatesRes, mergedRes] = await Promise.all([
                    fetch(`/api/team/${siteId}/rss/templates`),
                    fetch(`/api/team/${siteId}/rss/merged`)
                ])

                if (templatesRes.ok) {
                    setTemplates(await templatesRes.json())
                }
                if (mergedRes.ok) {
                    setMergedFeeds(await mergedRes.json())
                }
            } catch (err: any) {
                toast.error("Failed to load feeds")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [siteId])

    // Delete template
    const deleteTemplate = async (templateId: string) => {
        setDeleting(templateId)
        try {
            const response = await fetch(`/api/team/${siteId}/rss/templates/${templateId}`, {
                method: "DELETE"
            })
            if (!response.ok) throw new Error("Failed to delete template")

            setTemplates(prev => prev.filter(t => t.id !== templateId))
            toast.success("Template deleted")
        } catch (err: any) {
            toast.error("Failed to delete template")
        } finally {
            setDeleting(null)
        }
    }

    // Copy feed URL
    const copyFeedUrl = (templateId: string) => {
        const feedUrl = `${window.location.origin}/api/rss/template/${templateId}`
        navigator.clipboard.writeText(feedUrl)
        toast.success("Feed URL copied!", {
            description: feedUrl
        })
    }

    // Copy merged feed URL
    const copyMergedFeedUrl = (feedId: string) => {
        const feedUrl = `${window.location.origin}/api/rss/merged/${feedId}`
        navigator.clipboard.writeText(feedUrl)
        toast.success("Merged feed URL copied!", {
            description: feedUrl
        })
    }

    // Count selectors configured for a template
    const countSelectors = (template: FeedTemplate) => {
        const selectors = [
            template.containerSelector,
            template.titleSelector,
            template.linkSelector,
            template.thumbnailSelector,
            template.descriptionSelector,
            template.dateSelector,
            template.authorSelector
        ]
        return selectors.filter(Boolean).length
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname
        } catch {
            return url
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold flex items-center gap-2">
                                <Rss className="h-5 w-5 text-orange-500" />
                                RSS Feeds
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Create custom RSS feeds from any website
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Feed
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/${siteId}/projects/website/rss/builder`}>
                                        <Globe className="h-4 w-4 mr-2" />
                                        Scrape Website
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/${siteId}/projects/website/rss/merge`}>
                                        <Merge className="h-4 w-4 mr-2" />
                                        Merge Feeds
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-6">
                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader className="pb-3">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-48 mt-1" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-24 mt-2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : templates.length === 0 && mergedFeeds.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                                <Rss className="h-8 w-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No feed templates yet</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                                Create your first custom RSS feed by selecting elements from any website
                            </p>
                            <Button asChild>
                                <Link href={`/dashboard/${siteId}/projects/website/rss/builder`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Feed Template
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map((template) => (
                                <Card key={template.id} className="group hover:border-primary/30 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-base truncate">
                                                    {template.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Globe className="h-3 w-3" />
                                                    <span className="truncate">{getHostname(template.targetUrl)}</span>
                                                </CardDescription>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => copyFeedUrl(template.id)}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Feed URL
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/api/rss/template/${template.id}`} target="_blank" rel="noopener noreferrer">
                                                            <Rss className="h-4 w-4 mr-2" />
                                                            View RSS Feed
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={template.targetUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            View Source
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => deleteTemplate(template.id)}
                                                                    disabled={deleting === template.id}
                                                                >
                                                                    {deleting === template.id ? "Deleting..." : "Delete"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                <span>{countSelectors(template)} selectors</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(template.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
                                            <Badge variant="outline" className="text-[10px] h-5 bg-orange-500/10 text-orange-600 border-orange-500/30">
                                                <Rss className="h-2.5 w-2.5 mr-1" />
                                                RSS
                                            </Badge>
                                            <button
                                                onClick={() => copyFeedUrl(template.id)}
                                                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                            >
                                                <Link2 className="h-3 w-3" />
                                                Copy URL
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Merged Feeds */}
                            {mergedFeeds.map((feed) => (
                                <Card key={feed.id} className="group hover:border-primary/30 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-base truncate">
                                                    {feed.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Merge className="h-3 w-3" />
                                                    <span className="truncate">{feed.sources.length} sources merged</span>
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => copyMergedFeedUrl(feed.id)}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Feed URL
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/api/rss/merged/${feed.id}`} target="_blank" rel="noopener noreferrer">
                                                            <Rss className="h-4 w-4 mr-2" />
                                                            View RSS Feed
                                                        </a>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {feed.filters?.include && feed.filters.include.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span>+{feed.filters.include.length} include</span>
                                                </div>
                                            )}
                                            {feed.filters?.exclude && feed.filters.exclude.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span>-{feed.filters.exclude.length} exclude</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(feed.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
                                            <Badge variant="outline" className="text-[10px] h-5 bg-purple-500/10 text-purple-600 border-purple-500/30">
                                                <Merge className="h-2.5 w-2.5 mr-1" />
                                                Merged
                                            </Badge>
                                            <button
                                                onClick={() => copyMergedFeedUrl(feed.id)}
                                                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                            >
                                                <Link2 className="h-3 w-3" />
                                                Copy URL
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

export default RSSPage
