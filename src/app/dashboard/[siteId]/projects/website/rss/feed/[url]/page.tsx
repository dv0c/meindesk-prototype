'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeed } from "@/hooks/useFeed"
import { useFetch } from "@/hooks/useFetch"
import { SaveFeed } from "@/lib/actions/helpers/save-feed"
import { ArrowLeft, Link2, List } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { use } from "react"
import { toast } from "sonner"

const page = ({ params }: { params: { siteId: string, url: string } }) => {
    const router = useRouter()
    const { siteId, url } = use(params as any) as any
    const { data, error: dataError, loading: dataLoading } = useFetch(`/api/team/${siteId}/rss/my-feed`)
    const [isSaved, setIsSaved] = React.useState(false)

    const { feed, error, loading } = useFeed(url)

    React.useEffect(() => {
        if (data && feed) {
            const normalize = (u?: string) => (u ? decodeURIComponent(u).replace(/\/+$/, "") : "")
            const feedUrlNorm = normalize(feed.feedUrl as string)
            const saved = data.find((f: any) => normalize(f.url) === feedUrlNorm)
            setIsSaved(!!saved)
        }
    }, [data, feed])

    const save = async () => {
        if (!feed || isSaved) return
        await SaveFeed({
            data: {
                title: feed.site.title || "Untitled",
                url: feed.feedUrl,
                siteId: siteId,
                description: feed.description || "",
                icon: feed.site.favicon || "",
            }, siteId
        }).then((res) => {
            toast.success("Feed saved to your feeds!")
            console.log('SAVED DATA', res, "FETCHED DATA", data)
        })

    }

    if (loading || dataLoading) return <FeedSkeleton />

    if (error || dataError) return <div className="p-10 text-red-500">Error loading feed: {error || dataError}</div>


    return <div>
        <header className="sticky top-0 left-0 py-5 bg-background z-1">
            <div className="flex items-center justify-between bg-background pb-5 border-b">
                <div className="flex gap-3 px-5 items-center">
                    <Button className="cursor-pointer" onClick={() => router.push(`/dashboard/${siteId}/projects/website/rss/my-feed`)} variant={'ghost'} size={'icon-sm'}>
                        <ArrowLeft />
                    </Button>
                    {feed?.site.favicon && <img src={feed.site.favicon} alt="Site Favicon" className="object-cover w-10 h-10 rounded-full" />}
                    <div className="flex flex-col">
                        {feed?.site.title}
                        <div className="text-sm text-muted-foreground">
                            {feed?.feedUrl}
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <main className="h-full">
            {loading && <div>Loading feed...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            <div className="relative flex justify-between max-w-4xl mx-auto">
                {!isSaved && (
                    <div className="absolute max-w-xl top-[50px] left-0 w-full flex justify-center items-center mx-auto">
                        <Button onClick={save} className=" cursor-pointer bg-accent-foreground" variant={'outline'}>
                            Save to my feeds
                        </Button>
                    </div>
                )}
                <div className="flex flex-col gap-5">
                    <h1 className="text-lg font-semibold border-b py-5">Feed Preview</h1>
                    <div className="flex justify-between items-center">
                        <Button disabled variant={'outline'} size={'sm'}>Sort by: Auto</Button>
                        <Button disabled variant={'outline'} size={'sm'}>
                            <List className="mr-2 h-4 w-4" /> List</Button>
                    </div>
                    {feed && (
                        feed.items.length === 0 ? (
                            <div>No items found in the feed.</div>
                        ) : (
                            feed.items.map((item, index) => (
                                <Card key={index} className="bg-background max-w-xl border-0 border-b pb-10">
                                    <CardHeader className="px-0">
                                        <CardTitle>
                                            <a href={item.link || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {item.title || 'No title'}
                                            </a>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-0">
                                        <img src={item.thumbnail || ''} alt={item.title || 'Thumbnail'} className="mb-4 w-full max-w-full max-h-[400px]\\" />
                                        <div className="">
                                            <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: item.description || 'No description' }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )
                    )}
                </div>
                <div>
                    <div className="sticky top-[14%] left-0">
                        Feed Preview via <Badge variant="secondary">{feed?.type}</Badge>
                        <Link href={feed?.feedUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex line-clamp-1 max-w-[300px] overflow-hidden items-center mt-2 text-sm text-muted-foreground hover:underline">
                            <Link2 className="mr-2" size={14} />
                            {feed?.feedUrl}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    </div>
}

export default page


const FeedSkeleton = () => {
    return (
        <div>
            <header className="sticky top-0 left-0 py-5 bg-background z-1">
                <div className="flex items-center justify-between bg-background pb-5 border-b">
                    <div className="flex gap-3 px-5 items-center">
                        <Button className="cursor-pointer" variant="ghost" size="icon-sm" disabled>
                            <ArrowLeft />
                        </Button>
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col">
                            <Skeleton className="w-32 h-4 mb-2" />
                            <Skeleton className="w-24 h-3" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="mt-5 pt-5">
                <div className="flex justify-between gap-5 max-w-3xl mx-auto">
                    <div className="flex flex-col gap-5 w-full">
                        <Skeleton className="w-32 h-6 mb-2" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-24 h-8 rounded-md" />
                            <Skeleton className="w-20 h-8 rounded-md" />
                        </div>

                        {/* Feed items */}
                        {[...Array(4)].map((_, i) => (
                            <Card
                                key={i}
                                className="bg-background max-w-xl border-0 border-b pb-10"
                            >
                                <CardHeader className="px-0">
                                    <Skeleton className="w-3/4 h-5 mb-2" />
                                </CardHeader>
                                <CardContent className="px-0">
                                    <Skeleton className="w-full h-56 mb-4 rounded-lg" />
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="w-full h-3" />
                                        <Skeleton className="w-5/6 h-3" />
                                        <Skeleton className="w-4/5 h-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="hidden md:block w-[250px]">
                        <Skeleton className="w-full h-[300px] rounded-lg" />
                    </div>
                </div>
            </main>
        </div>
    )
}