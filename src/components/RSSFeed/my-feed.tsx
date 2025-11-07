"use client"

import { Rss as RSS } from "@prisma/client"
import { Menu, Rss } from "lucide-react"
import PageWrapper from "../PageWrapper"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import CreateNewFeed from "./CreateButtonPage"
import { useFetch } from "@/hooks/useFetch"
import Link from "next/link"
import { useSite } from "../Contexts/site-id-context"

const MyFeed = () => {
    const { siteId } = useSite()
    const { data, error, loading } = useFetch<RSS[]>(`/api/team/${siteId}/rss/my-feed`)
    const feeds = Array.isArray(data) ? data : []

    if (!siteId) return null

    // Skeleton cards for loading state
    const renderSkeletons = () => {
        return Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="animate-pulse p-4 border rounded-md">
                <CardContent className="px-3 pb-3 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-sm"></div>
                        <div className="flex flex-col gap-2 w-full min-w-0">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-full max-w-[200px]"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))
    }

    return (
        <PageWrapper
            action={<CreateRSS siteId={siteId} />}
            title="My RSS Feed"
            description="Manage your RSS feed subscriptions"
        >
            {loading ? (
                <div className="grid sm:grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {renderSkeletons()}
                </div>
            ) : error || !siteId ? (
                <p className="text-red-500">Failed to load feeds: {error}</p>
            ) : feeds.length === 0 ? (
                <p className="text-muted-foreground">No feeds created yet.</p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {feeds.map((feed) => {
                        const feedUrl = feed.url ? decodeURIComponent(feed.url) : "Untitled Feed"

                        return (
                            <Link
                                key={feed.id}
                                href={`/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(feed.url as string)}`}
                                className="block"
                            >
                                <Card className="group relative p-4 border rounded-md hover:shadow-md transition">
                                    <CardContent className="px-3 pb-3 w-full">
                                        {/* Feed actions */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon-sm" variant="ghost" className="cursor-pointer">
                                                        <Menu />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit Feed</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">Delete Feed</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Feed info */}
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl flex-shrink-0">
                                                {feed.icon ? (
                                                    <img
                                                        src={feed.icon}
                                                        alt="feed icon"
                                                        className="object-cover rounded-sm w-12 h-12"
                                                    />
                                                ) : (
                                                    <Rss className="text-blue-500 w-12 h-12" />
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-lg font-bold truncate max-w-full">{feed.title || "Untitled Feed"}</span>
                                                <p
                                                    className="text-sm text-accent truncate max-w-full break-all"
                                                    title={feedUrl}
                                                >
                                                    {feedUrl}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}
        </PageWrapper>
    )
}

export default MyFeed

const CreateRSS = ({ siteId }: { siteId: string }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="cursor-pointer" variant="default">
                    Create RSS Feed
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full sm:h-auto p-6 rounded-md">
                <CreateNewFeed siteId={siteId} />
            </DialogContent>
        </Dialog>
    )
}
