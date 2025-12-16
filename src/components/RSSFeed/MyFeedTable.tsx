"use client"

import { ArrowRight, Rss, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface Feed {
    id: string
    title: string
    url: string | null
    icon: string | null
    description: string | null
}

interface MyFeedTableProps {
    feeds: Feed[]
    loading: boolean
    siteId: string
    onDelete?: () => void
}

export function MyFeedTable({ feeds, loading, siteId, onDelete }: MyFeedTableProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set())

    // Filter feeds based on search
    const filteredFeeds = useMemo(() => {
        if (!feeds) return []
        return feeds.filter((feed) => {
            const matchesSearch =
                feed.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feed.url?.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesSearch
        })
    }, [feeds, searchQuery])

    const handleRowClick = (feedUrl: string) => {
        window.location.href = `/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(feedUrl)}`
    }

    const toggleFeedSelection = (feedId: string) => {
        const newSelected = new Set(selectedFeeds)
        if (newSelected.has(feedId)) {
            newSelected.delete(feedId)
        } else {
            newSelected.add(feedId)
        }
        setSelectedFeeds(newSelected)
    }

    const toggleSelectAll = () => {
        const allIds = new Set(filteredFeeds.map((f) => f.id))
        if (selectedFeeds.size === filteredFeeds.length && filteredFeeds.length > 0) {
            setSelectedFeeds(new Set())
        } else {
            setSelectedFeeds(allIds)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedFeeds.size === 0) return

        try {
            await Promise.all(
                Array.from(selectedFeeds).map((feedId) =>
                    fetch(`/api/team/${siteId}/rss/${feedId}`, {
                        method: "DELETE",
                    })
                )
            )
            toast.success(`${selectedFeeds.size} feed(s) deleted successfully`)
            setSelectedFeeds(new Set())
            onDelete?.()
        } catch (error) {
            toast.error("Failed to delete feeds")
        }
    }

    const isAllSelected = selectedFeeds.size === filteredFeeds.length && filteredFeeds.length > 0

    return (
        <div className="space-y-4 w-full">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search feeds..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-background border-border"
                    />
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedFeeds.size > 0 && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-muted/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="text-sm font-medium">
                        {selectedFeeds.size} feed(s) selected
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="h-8"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFeeds(new Set())}
                            className="h-8"
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="h-10 text-xs font-medium text-muted-foreground w-[50px]">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all feeds"
                                />
                            </TableHead>
                            <TableHead className="h-10 text-xs font-medium text-muted-foreground">Feed</TableHead>
                            <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden md:table-cell">Source</TableHead>
                            <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right w-[60px]"></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            // Skeleton loading state
                            Array.from({ length: 5 }).map((_, idx) => (
                                <TableRow key={idx} className="border-border">
                                    <TableCell className="py-3">
                                        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted animate-pulse rounded-md" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                                <div className="h-3 w-24 bg-muted animate-pulse rounded md:hidden" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 hidden md:table-cell">
                                        <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <div className="h-4 w-4 bg-muted animate-pulse rounded ml-auto" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredFeeds.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    {searchQuery ? "No feeds found matching your search." : "No feeds found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredFeeds.map((feed) => {
                                const feedUrl = feed.url ? decodeURIComponent(feed.url) : "Untitled Feed"
                                let domain = ''
                                try {
                                    domain = feedUrl ? new URL(feedUrl).hostname.replace('www.', '') : ''
                                } catch {
                                    domain = feedUrl
                                }

                                return (
                                    <TableRow
                                        key={feed.id}
                                        className={`border-border cursor-pointer transition-all duration-200 ${selectedFeeds.has(feed.id) ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                                        onClick={() => handleRowClick(feed.url as string)}
                                    >
                                        <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedFeeds.has(feed.id)}
                                                onCheckedChange={() => toggleFeedSelection(feed.id)}
                                                aria-label={`Select ${feed.title}`}
                                            />
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                                    {feed.icon ? (
                                                        <img
                                                            src={feed.icon}
                                                            alt={feed.title || "Feed"}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <Rss className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm overflow-hidden max-w-md truncate">
                                                        {feed.title || "Untitled Feed"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate md:hidden">
                                                        {domain}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 hidden md:table-cell">
                                            <span className="text-sm text-muted-foreground">
                                                {domain}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-right">
                                            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
