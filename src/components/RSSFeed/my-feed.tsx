"use client"

import { Rss as RSS } from "@prisma/client"
import { Menu, Rss } from "lucide-react"
import PageWrapper from "../PageWrapper"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "../ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import CreateNewFeed from "./CreateButtonPage"
import { useFetch } from "@/hooks/useFetch"
import Link from "next/link"

const MyFeed = ({ siteId }: { siteId: string }) => {
    const { data, error, loading } = useFetch<RSS[]>(`/api/team/${siteId}/rss/my-feed`)

    if (loading) {
        return (
            <PageWrapper action title="My RSS Feed" description="Manage your RSS feed subscriptions">
                <p className="text-muted-foreground">Loading your feeds...</p>
            </PageWrapper>
        )
    }

    if (error) {
        return (
            <PageWrapper action title="My RSS Feed" description="Manage your RSS feed subscriptions">
                <p className="text-red-500">Failed to load feeds: {error}</p>
            </PageWrapper>
        )
    }

    const feeds = Array.isArray(data) ? data : []

    return (
        <PageWrapper
            action={<CreateRSS siteId={siteId} />}
            title="My RSS Feed"
            description="Manage your RSS feed subscriptions"
        >
            {feeds.length === 0 ? (
                <p className="text-muted-foreground">No feeds created yet.</p>
            ) : (
                <div className="flex items-center flex-wrap gap-5">
                    {feeds.map((feed) => (
                        <Link
                            key={feed.id}
                            href={`/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(feed.url as string)}`}
                            className="block"
                        >
                            <Card className="p-4 border rounded-md group">
                                <CardContent className="px-3 pb-7 w-full">
                                    {/* Feed actions (edit/delete) */}
                                    <div className="flex w-full items-center opacity-0 transition-opacity group-hover:opacity-100 justify-end">
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
                                        <div className="text-3xl">
                                            {feed.icon ? (
                                                <img
                                                    src={feed.icon}
                                                    alt="feed icon"
                                                    className="object-cover rounded-sm w-12 h-12"
                                                />
                                            ) : (
                                                <Rss className="text-blue-500" />
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-bold truncate max-w-[300px]">
                                                {feed.title || "Untitled Feed"}
                                            </span>
                                            <p className="text-sm text-accent leading-3 max-w-[350px] line-clamp-1">
                                                {decodeURIComponent(feed.url as string)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
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
            <DialogContent className="min-w-screen h-screen">
                <CreateNewFeed siteId={siteId} />
            </DialogContent>
        </Dialog>
    )
}
