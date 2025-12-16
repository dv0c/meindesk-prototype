"use client"

import { useFetch } from "@/hooks/useFetch"
import { Rss as RSS } from "@prisma/client"
import { Plus, RssIcon } from "lucide-react"
import { useSite } from "../Contexts/site-id-context"
import PageWrapper from "../PageWrapper"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { MyFeedTable } from "./MyFeedTable"
import CreateNewFeed from "./CreateButtonPage"

const MyFeed = () => {
    const { siteId } = useSite()
    const { data, error, loading, refetch } = useFetch<RSS[]>(`/api/team/${siteId}/rss/my-feed`)
    const feeds = Array.isArray(data) ? data : []

    if (!siteId) return null

    return (
        <PageWrapper
            action={<CreateRSS siteId={siteId} />}
            title="My RSS Feeds"
            description="Manage your RSS feed subscriptions"
        >
            {error || !siteId ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
                    <p className="text-destructive font-medium">Failed to load feeds</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
            ) : feeds.length === 0 && !loading ? (
                <NoFeed siteId={siteId} />
            ) : (
                <MyFeedTable feeds={feeds} loading={loading} siteId={siteId} onDelete={refetch} />
            )}
        </PageWrapper>
    )
}

export default MyFeed

const CreateRSS = ({ siteId }: { siteId: string }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="cursor-pointer gap-2" variant="default">
                    <Plus className="h-4 w-4" />
                    Add RSS Feed
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-7xl">
                <CreateNewFeed siteId={siteId} />
            </DialogContent>
        </Dialog>
    )
}


const NoFeed = ({ siteId }: { siteId: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <RssIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <Plus className="h-3 w-3 text-muted-foreground" />
            </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">No RSS Feeds Yet</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
            Start by adding your first RSS feed to automatically import content from your favorite sources.
        </p>
        <CreateRSS siteId={siteId} />
    </div>
)