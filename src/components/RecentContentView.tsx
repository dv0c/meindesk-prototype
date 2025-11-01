"use client"

import { ArrowUpRight, Clock, FileIcon, FileText, FolderIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { useStats, RecentItem } from "@/hooks/use-stats"

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
}

const RecentContentView = ({ siteId }: { siteId: string }) => {
    const { data, loading, error } = useStats(siteId, 5)

    if (loading) return <Card className="lg:col-span-2">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                            <div className="size-10 animate-pulse rounded-md bg-muted" />
                            <div className="space-y-2">
                                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                        <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
    if (error) return null

    // Combine recent articles and categories for display
    const recentItems: { item: RecentItem; type: "Article" | "Category" }[] = []

    data?.recent?.articles?.forEach(a => recentItems.push({ item: a, type: "Article" }))
    data?.recent?.categories?.forEach(c => recentItems.push({ item: c, type: "Category" }))

    // Sort by createdAt descending
    recentItems.sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime())

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Content</CardTitle>
                        <CardDescription>Your latest articles and categories</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                        View all
                        <ArrowUpRight className="ml-1 size-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recentItems.map(({ item, type }, i) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                    {type === "Article" ? <FileText className="size-5" /> : <FolderIcon className="size-5" />}
                                </div>
                                <div>
                                    <p className="font-medium">{item.title || item.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        {formatDate(item.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="default">{type}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentContentView
