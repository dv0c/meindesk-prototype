'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFeed } from "@/hooks/useFeed"
import { useFetch } from "@/hooks/useFetch"
import { ChangeAutoImport } from "@/lib/actions/helpers/auto-import-toggle"
import { DeleteFeed } from "@/lib/actions/helpers/delete-feed"
import { SaveFeed } from "@/lib/actions/helpers/save-feed"
import { SaveRssToArticles } from "@/lib/actions/helpers/save-rss-to-articles"
import { ArrowLeft, Edit, Link2, List, MoreHorizontal, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const FeedPage = ({ params }: { params: { siteId: string, url: string } }) => {
    const router = useRouter()
    const isMobile = useIsMobile()
    const { siteId, url } = use(params as any) as any

    const { data: myFeeds, error: dataError, loading: dataLoading } = useFetch(`/api/team/${siteId}/rss/my-feed`)
    const { feed, error, loading } = useFeed(url)

    const [isSaved, setIsSaved] = useState(false)
    const [autoImport, setAutoImport] = useState(false)
    const [currentData, setCurrentData] = useState<any>(null)
    const [openDrawer, setOpenDrawer] = useState<boolean>(false)
    const [feedSaving, setFeedSaving] = useState<boolean>(false)

    // Normalize URL helper
    const normalizeUrl = useCallback((u?: string) => u ? decodeURIComponent(u).replace(/\/+$/, "") : "", [])

    // Sync saved state when feed or myFeeds change
    useEffect(() => {
        if (!feed || !myFeeds) return
        const savedFeed = myFeeds.find((f: any) => normalizeUrl(f.url) === normalizeUrl(feed.feedUrl as string))
        setIsSaved(!!savedFeed)
        setAutoImport(savedFeed?.autoImport ?? false)
        setCurrentData(savedFeed ?? null)
    }, [feed, myFeeds, normalizeUrl])

    // Save feed
    const handleSaveFeed = async () => {
        if (!feed || isSaved) return
        setFeedSaving(true)
        try {
            const res = await SaveFeed({
                data: {
                    title: feed.title || "Untitled",
                    url: feed.feedUrl,
                    siteId,
                    description: feed.description || "",
                    icon: feed.site.favicon || "",
                    autoImport: false
                },
                siteId,
                feedItems: feed.items
            })
            toast.success("Feed saved to your feeds!")
            setFeedSaving(false)
            location.reload()
        } catch (err) {
            console.error(err)
            toast.error("Failed to save feed")
            setFeedSaving(false)
        }
    }

    // Toggle auto-import
    const handleAutoImport = async (checked: boolean) => {
        if (!feed || !currentData) return
        setAutoImport(checked)
        try {
            const res = await ChangeAutoImport({
                feed: currentData,
                siteId,
                autoImport: checked
            })
            setAutoImport(res.autoImport)
            toast.success(`Auto-import ${res.autoImport ? "Enabled" : "Disabled"}`)
        } catch (err) {
            setAutoImport(!checked) // rollback
            toast.error("Failed to update auto-import")
        }
    }

    if (loading || dataLoading) return <FeedSkeleton />
    if (error || dataError) return <div className="p-10 text-red-500">Error loading feed: {error || dataError}</div>

    return (
        <div>
            {/* Header */}
            <header className="sticky top-0 left-0 py-5 bg-background z-10 border-b">
                <div className="flex items-center justify-between gap-3 px-5">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon-sm" onClick={() => router.push(`/dashboard/${siteId}/projects/website/rss/my-feed`)}>
                            <ArrowLeft />
                        </Button>
                        {feed?.site.favicon && <img src={feed.site.favicon} alt="Site Favicon" className="w-10 h-10 rounded-full object-cover" />}
                        <div className="flex flex-col">
                            <span>{feed?.title}</span>
                            <span className="text-sm text-muted-foreground">{feed?.feedUrl}</span>
                        </div>
                    </div>
                    {isMobile && (
                        <div>
                            <Button size={'icon-sm'} variant={'outline'} onClick={() => setOpenDrawer(true)}>
                                <MoreHorizontal />
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="h-full p-5">
                <div className="relative flex justify-between gap-5 max-w-4xl mx-auto">
                    {!isSaved && (
                        <div className="absolute top-[50px] left-0 max-w-xl w-full flex justify-center">
                            <Button variant="outline" disabled={feedSaving} onClick={handleSaveFeed} className="bg-accent-foreground">
                                {feedSaving && <Spinner />}
                                Save to my feeds
                            </Button>
                        </div>
                    )}

                    {/* Feed Preview */}
                    <div className="flex flex-col gap-5 w-full">
                        <h1 className="text-lg font-semibold border-b py-5">Feed Preview</h1>
                        <div className="flex justify-between items-center">
                            <Button disabled variant="outline" size="sm">Sort by: Auto</Button>
                            <Button disabled variant="outline" size="sm"><List className="mr-2 h-4 w-4" /> List</Button>
                        </div>

                        {feed?.items.length ? feed.items.map((item, idx) => (
                            <Card key={idx} className="bg-background group relative w-full border-0 border-b pb-10">
                                <CardHeader className="px-0">
                                    <CardTitle>
                                        <Link href={item.link || '#'} target="_blank" className="hover:underline text-xl">{item.title || "No title"}</Link>
                                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity top-0 right-0">
                                            <Button variant="outline" size="icon-sm"><Upload /></Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-0">
                                    {item.thumbnail && <img src={item.thumbnail} alt={item.title || ""} className="mb-4 w-full max-h-[400px]" />}
                                    <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: item.description || "No description" }} />
                                    <div className="text-xs mt-5 flex items-center gap-1">
                                        <Badge variant="secondary">{feed.type} {(feed.type === "Youtube" || feed.type === "Generator") && "SRC"}</Badge>
                                        <p>provided by <Link href={item.site.url || "#"} className="underline">{item.site.title}</Link></p>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : <div>No items found in the feed.</div>}
                    </div>
                    {!isMobile ? (

                        <div className="sticky h-full w-full max-w-[33%] top-[10%] hidden md:flex flex-col gap-3">
                            {isSaved && (
                                <FeedSettings
                                    feed={feed}
                                    autoImport={autoImport}
                                    setAutoImport={handleAutoImport}
                                    currentData={currentData}
                                    siteId={siteId}
                                    myFeeds={myFeeds}
                                />
                            )}

                            {/* Feed Link */}
                            <div className="pt-5">
                                Feed Preview via <Badge variant="secondary">{feed?.type}</Badge>
                                <Link href={feed?.feedUrl || '#'} target="_blank" className="flex items-center mt-2 text-sm text-muted-foreground hover:underline line-clamp-1 max-w-[300px]">
                                    <Link2 className="mr-2" size={14} /> {feed?.feedUrl}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                            <DrawerContent className="w-full p-5 mx-auto min-h-[80vh]">
                                <div>
                                    {isSaved && (
                                        <FeedSettings
                                            feed={feed}
                                            autoImport={autoImport}
                                            setAutoImport={handleAutoImport}
                                            currentData={currentData}
                                            siteId={siteId}
                                            myFeeds={myFeeds}
                                        />
                                    )}

                                    {/* Feed Link */}
                                    <div className="pt-5">
                                        Feed Preview via <Badge variant="secondary">{feed?.type}</Badge>
                                        <Link href={feed?.feedUrl || '#'} target="_blank" className="flex items-center mt-2 text-sm text-muted-foreground hover:underline line-clamp-1 max-w-[300px]">
                                            <Link2 className="mr-2" size={14} /> {feed?.feedUrl}
                                        </Link>
                                    </div>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    )}
                </div>
            </main >
        </div >
    )
}

// Settings Dialog extracted
const FeedSettings = ({ feed, autoImport, setAutoImport, currentData, siteId, myFeeds }: any) => {
    const [openDelete, setOpenDelete] = useState(false);
    const [loading, setLoading] = useState<boolean>(false)
    const handleDelete = async () => {
        if (!feed) return;
        try {
            await DeleteFeed({ feedId: myFeeds.find((f: any) => f.url === feed.feedUrl)?.id, siteId });
            toast.success("Feed deleted successfully!");
            setOpenDelete(false);
            // Redirect back to feed list
            window.location.href = `/dashboard/${siteId}/projects/website/rss/my-feed`;
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete feed");
        }
    };
    return (
        <div className="space-y-3 space-x-3">
            <h1 className="text-lg font-semibold">Settings</h1>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{feed?.site.title} Settings</DialogTitle>
                        <DialogDescription>Manage your feed options here</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex flex-col">
                            <Label htmlFor="feed-title">Feed Title</Label>
                            <Input id="feed-title" defaultValue={feed?.site.title} placeholder="Feed title" />
                        </div>

                        <div className="flex flex-col">
                            <Label htmlFor="feed-description">Description</Label>
                            <Textarea id="feed-description" defaultValue={feed?.description || ""} placeholder="Feed description" className="resize-none" />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-import" className="mb-0">Auto-import</Label>
                            <Switch id="auto-import" checked={autoImport} onCheckedChange={setAutoImport} />
                        </div>

                        {feed?.site.favicon && (
                            <div className="flex items-center gap-3">
                                <img src={feed.site.favicon} alt="Favicon" className="w-10 h-10 rounded-full border" />
                                <span className="text-sm text-muted-foreground truncate">{feed.site.favicon}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={() => toast.success("Feed settings saved!")}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button
                variant="outline"
                size="sm"
                disabled={!feed || feed.items.length === 0 || loading}
                onClick={async () => {
                    try {
                        setLoading(true)
                        toast.loading("Saving feed items to articles...", { id: "saveRss" });
                        const res = await SaveRssToArticles({ siteId, rssId: myFeeds.find((f: any) => f.url === feed?.feedUrl)?.id })
                        toast.success(res.message || "Saved!", { id: "saveRss" });
                        setLoading(false)
                    } catch (err: any) {
                        setLoading(false)
                        toast.error(err.message || "Failed to save articles", { id: "saveRss" });
                    }
                }}
            >
                {loading ? <Spinner className="mr-2" /> : <Upload className="mr-2 h-4 w-4" />  }
                 Save as articles
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                        <MoreHorizontal size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feed?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this feed? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}

export default FeedPage


const FeedSkeleton = () => {
    return (
        <div className="relative">
            <header className="sticky top-0 left-0 py-5 bg-background z-10">
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
                <div className="flex justify-between gap-5 max-w-3xl mx-auto relative">
                    {/* Centered message */}
                    <div className="fixed  inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
                        <p className="text-lg font-semibold text-foreground mb-2">
                            Feed is generating, please wait.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            This could take more than 20 seconds.
                        </p>
                    </div>

                    <div className="flex flex-col gap-5 w-full opacity-70">
                        <Skeleton className="w-32 h-6 mb-2" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-24 h-8 rounded-md" />
                            <Skeleton className="w-20 h-8 rounded-md" />
                        </div>

                        {/* Feed items */}
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="bg-background max-w-xl border-0 border-b pb-10">
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

                    <div className="hidden md:block w-[250px] opacity-70">
                        <Skeleton className="w-full h-[300px] rounded-lg" />
                    </div>
                </div>
            </main>
        </div>
    )
}