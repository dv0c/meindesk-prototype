'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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
import { ImportSingleRssItem } from "@/lib/actions/helpers/import-single-rss-item"
import { RemoveRssArticle } from "@/lib/actions/helpers/remove-rss-article"
import { sanitizeRichHtml } from "@/lib/security/sanitize-html"
import { ArrowLeft, ArrowUpRight, Check, Edit, Grid3X3, Link2, List, MoreHorizontal, RssIcon, Trash2, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const FeedPage = ({ params }: { params: Promise<{ siteId: string; url: string }> }) => {
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
    const [importingItemIndex, setImportingItemIndex] = useState<number | null>(null)
    const [importedItems, setImportedItems] = useState<Map<string, string>>(new Map()) // Map of item link/guid to article ID
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list') // View mode toggle

    // Normalize URL helper
    const normalizeUrl = useCallback((u?: string) => u ? decodeURIComponent(u).replace(/\/+$/, "") : "", [])

    // Sync saved state when feed or myFeeds change
    useEffect(() => {
        if (!feed || !myFeeds) return
        const savedFeed = myFeeds.find((f: any) => normalizeUrl(f.url) === normalizeUrl(feed.feedUrl as string))
        setIsSaved(!!savedFeed)
        setAutoImport(savedFeed?.autoImport ?? false)
        setCurrentData(savedFeed ?? null)
        console.log(feed)

        // Fetch imported items if feed is saved
        if (savedFeed) {
            fetchImportedItems(savedFeed.id)
        }
    }, [feed, myFeeds, normalizeUrl])


    useEffect(() => {
        if (!error || !myFeeds || (error || dataError) !== "No feed could be generated") return;

        const savedFeed = myFeeds.find((f: any) => normalizeUrl(f.url) === normalizeUrl(url));
        if (!savedFeed) return;

        const autoDeleteFeed = async () => {
            try {
                toast.warning("This feed is no longer available. Removing it from your list...");
                await DeleteFeed({ feedId: savedFeed.id, siteId });
                toast.success("Invalid feed removed successfully!");
                router.push(`/dashboard/${siteId}/projects/website/rss/my-feed`);
            } catch (err: any) {
                console.error("Auto-delete failed:", err);
                toast.error("Failed to remove invalid feed.");
            }
        };

        autoDeleteFeed();
    }, [error, myFeeds, siteId, url, normalizeUrl, router]);


    // Save feed
    const handleSaveFeed = async () => {
        if (!feed || isSaved) return
        setFeedSaving(true)
        console.log(feed)
        try {
            const res = await SaveFeed({
                data: {
                    title: feed.title || "Untitled",
                    url: feed.feedUrl,
                    siteId,
                    description: feed.description || "",
                    icon: feed.site.favicon || "",
                    autoImport: false,
                    site_name: feed.site.title || feed.title || "Unknown"
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

    // Fetch imported items
    const fetchImportedItems = async (rssId: string) => {
        try {
            const response = await fetch(`/api/team/${siteId}/rss/${rssId}/imported-items`)
            if (response.ok) {
                const data = await response.json()
                const itemsMap = new Map<string, string>()
                data.forEach((item: any) => {
                    if (item?.key && item?.articleId) {
                        itemsMap.set(item.key, item.articleId)
                    }
                })
                setImportedItems(itemsMap)
            }
        } catch (err) {
            console.error("Failed to fetch imported items:", err)
        }
    }

    // Check if item is imported
    const isItemImported = (item: any): string | null => {
        const key = item.guid || item.link
        if (!key) return null
        return importedItems.get(key) || null
    }

    // Import or remove single feed item
    const handleToggleImport = async (item: any, index: number) => {
        if (!feed || !currentData) {
            toast.error("Please save this feed first before importing items")
            return
        }

        const articleId = isItemImported(item)
        setImportingItemIndex(index)

        try {
            if (articleId) {
                // Remove the article
                await RemoveRssArticle({ siteId, articleId })
                toast.success("Article removed successfully!")
                // Update local state
                const key = item.guid || item.link
                setImportedItems(prev => {
                    const newMap = new Map(prev)
                    newMap.delete(key)
                    return newMap
                })
            } else {
                // Import the item
                const res = await ImportSingleRssItem({
                    siteId,
                    rssId: currentData.id,
                    feedItem: item,
                })
                toast.success(res.message || "Article imported successfully!")
                // Refresh imported items
                await fetchImportedItems(currentData.id)
            }
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || (articleId ? "Failed to remove article" : "Failed to import article"))
        } finally {
            setImportingItemIndex(null)
        }
    }

    if (loading || dataLoading) return <FeedSkeleton />
    if (error || dataError) return <Empty className="border border-dashed">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <RssIcon />
            </EmptyMedia>
            <EmptyTitle>There is no RSS Feed.</EmptyTitle>
            <EmptyDescription>
                {error || dataError}
            </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button onClick={() => history.back()} variant={'outline'}>Go Back</Button>
        </EmptyContent>
    </Empty>

    return (
        <div className="min-h-screen bg-background">
            {/* Header with gradient accent */}
            <header className="sticky top-0 left-0 bg-background/95 backdrop-blur-sm z-10 border-b">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/${siteId}/projects/website/rss/my-feed`)}
                            className="hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        {/* Favicon with ring */}
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ring-2 ring-border overflow-hidden">
                            {feed?.site.favicon ? (
                                <img src={feed.site.favicon} alt="Site Favicon" className="w-full h-full object-cover" />
                            ) : (
                                <RssIcon className="h-6 w-6 text-primary" />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <h1 className="font-semibold text-lg">{feed?.title}</h1>
                            <span className="text-sm text-muted-foreground truncate max-w-[300px]">{feed?.feedUrl}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isSaved && (
                            <Button
                                onClick={handleSaveFeed}
                                disabled={feedSaving}
                                className="gap-2"
                            >
                                {feedSaving && <Spinner className="h-4 w-4" />}
                                Save to My Feeds
                            </Button>
                        )}
                        {isMobile && (
                            <Button size="icon" variant="outline" onClick={() => setOpenDrawer(true)}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-5 lg:p-8">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                    {/* Feed Items */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Feed Items</h2>
                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="h-7 px-2 gap-1.5"
                                    >
                                        <List className="h-3.5 w-3.5" />
                                        <span className="text-xs hidden sm:inline">List</span>
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="h-7 px-2 gap-1.5"
                                    >
                                        <Grid3X3 className="h-3.5 w-3.5" />
                                        <span className="text-xs hidden sm:inline">Grid</span>
                                    </Button>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {feed?.items.length || 0} items
                                </Badge>
                            </div>
                        </div>

                        {feed?.items.length ? (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-5'}>
                                {feed.items.map((item, idx) => (
                                    <Card
                                        key={idx}
                                        className="group overflow-hidden p-0 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/30"
                                    >
                                        <CardContent className="p-0">
                                            <div className={viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col md:flex-row'}>
                                                {/* Thumbnail */}
                                                {item.thumbnail && (
                                                    <div className={`relative shrink-0 overflow-hidden ${viewMode === 'grid'
                                                        ? 'w-full h-48'
                                                        : 'h-48 md:h-auto md:w-64'
                                                        }`}>
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.title || ""}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        {/* Overlay gradient */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        {/* Import Status Badge (Grid View Only) */}
                                                        {viewMode === 'grid' && (() => {
                                                            const imported = isItemImported(item)
                                                            const isWorking = importingItemIndex === idx

                                                            return (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        handleToggleImport(item, idx)
                                                                    }}
                                                                    disabled={!isSaved || isWorking}
                                                                    className={`absolute top-2 right-2 z-1 h-8 w-8 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${imported
                                                                        ? "bg-green-600/90 hover:bg-secondary cursor-pointer hover:text-white text-white shadow-lg"
                                                                        : "bg-black/60 text-white cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-secondary"
                                                                        }`}
                                                                    title={imported ? "Remove from articles" : "Import to articles"}
                                                                >
                                                                    {isWorking ? (
                                                                        <Spinner className="h-4 w-4" />
                                                                    ) : imported ? (
                                                                        <>
                                                                            <Check className="h-4 w-4 block group-hover:hidden" />
                                                                            <X className="h-4 w-4 hidden group-hover:block" />
                                                                        </>
                                                                    ) : (
                                                                        <Upload className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            )
                                                        })()}
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                                                    <div className="space-y-3">
                                                        {/* Title */}
                                                        <Link
                                                            href={item.link || '#'}
                                                            target="_blank"
                                                            className="group/link inline-flex items-start gap-2"
                                                        >
                                                            <h3 className="font-semibold text-lg leading-snug line-clamp-2 group-hover/link:text-primary transition-colors">
                                                                {item.title || "No title"}
                                                            </h3>
                                                            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover/link:text-primary transition-colors mt-1" />
                                                        </Link>

                                                        {/* Description */}
                                                        <div
                                                            className="text-sm text-muted-foreground line-clamp-2 [&_a]:text-primary [&_a]:underline"
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeRichHtml(item.description || "No description"),
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Footer */}
                                                    <div className={`pt-3 border-t border-border/50 ${viewMode === 'grid'
                                                        ? 'flex items-center gap-2'
                                                        : 'flex items-center justify-between'
                                                        }`}>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs bg-muted/50">
                                                                {feed.type}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground truncate">
                                                                {item.site?.title || feed.title}
                                                            </span>
                                                        </div>

                                                        {/* Import Button (List View Only) */}
                                                        {viewMode === 'list' && (() => {
                                                            const imported = isItemImported(item)
                                                            const isWorking = importingItemIndex === idx

                                                            return (
                                                                <Button
                                                                    variant={imported ? "ghost" : "ghost"}
                                                                    size="sm"
                                                                    onClick={() => handleToggleImport(item, idx)}
                                                                    disabled={!isSaved || isWorking}
                                                                    className={`h-8 px-3 transition-all gap-2 disabled:opacity-50 ${imported
                                                                        ? "opacity-100 bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600 dark:text-green-500 dark:hover:text-red-500"
                                                                        : "opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white"
                                                                        }`}
                                                                >
                                                                    {isWorking ? (
                                                                        <Spinner className="h-3.5 w-3.5" />
                                                                    ) : imported ? (
                                                                        <>
                                                                            <Check className="h-3.5 w-3.5" />
                                                                            <span className="text-xs text-inherit">Imported</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Upload className="h-3.5 w-3.5" />
                                                                            <span className="text-xs text-inherit">Import</span>
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            )
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <p className="text-muted-foreground">No items found in this feed.</p>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    {!isMobile ? (
                        <div className="lg:w-80 shrink-0 space-y-4">
                            <div className="sticky top-24">
                                {isSaved && (
                                    <Card className="mb-4">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">Feed Settings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <FeedSettings
                                                feed={feed}
                                                autoImport={autoImport}
                                                setAutoImport={handleAutoImport}
                                                currentData={currentData}
                                                siteId={siteId}
                                                myFeeds={myFeeds}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Feed Info */}
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Source:</span>
                                                <Badge variant="secondary">{feed?.type}</Badge>
                                            </div>
                                            <Link
                                                href={feed?.feedUrl || '#'}
                                                target="_blank"
                                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Link2 className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{feed?.feedUrl}</span>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                            <DrawerContent className="p-5 max-h-[85vh]">
                                <div className="space-y-4">
                                    {isSaved && (
                                        <div>
                                            <h3 className="font-semibold mb-3">Feed Settings</h3>
                                            <FeedSettings
                                                feed={feed}
                                                autoImport={autoImport}
                                                setAutoImport={handleAutoImport}
                                                currentData={currentData}
                                                siteId={siteId}
                                                myFeeds={myFeeds}
                                            />
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground">Source:</span>
                                            <Badge variant="secondary">{feed?.type}</Badge>
                                        </div>
                                        <Link
                                            href={feed?.feedUrl || '#'}
                                            target="_blank"
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            <Link2 className="h-4 w-4" />
                                            <span className="truncate">{feed?.feedUrl}</span>
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
    const [openEdit, setOpenEdit] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    // Controlled form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });

    // Initialize form data when dialog opens
    useEffect(() => {
        if (openEdit && currentData) {
            setFormData({
                title: currentData.title || feed?.title || '',
                description: currentData.description || feed?.description || '',
            });
        }
    }, [openEdit, currentData, feed]);

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

    const handleSaveEdit = async () => {
        if (!currentData) return;
        setSaving(true);
        try {
            const { UpdateFeed } = await import('@/lib/actions/helpers/update-feed');
            await UpdateFeed({
                feedId: currentData.id,
                siteId,
                data: {
                    title: formData.title,
                    description: formData.description,
                },
            });
            toast.success("Feed settings updated successfully!");
            setOpenEdit(false);
            // Refresh the page to show updated data
            setTimeout(() => location.reload(), 500);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to update feed");
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="space-y-4">
            {/* Auto-import toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex flex-col">
                    <span className="text-sm font-medium">Auto-import</span>
                    <span className="text-xs text-muted-foreground">Automatically import new items</span>
                </div>
                <Switch checked={autoImport} onCheckedChange={setAutoImport} />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Feed Settings</DialogTitle>
                            <DialogDescription>Update your feed title and description</DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="feed-title">Feed Title</Label>
                                <Input
                                    id="feed-title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Feed title"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="feed-description">Description</Label>
                                <Textarea
                                    id="feed-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Feed description"
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>

                            {feed?.site.favicon && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <img src={feed.site.favicon} alt="Favicon" className="w-8 h-8 rounded-lg object-cover" />
                                    <span className="text-sm text-muted-foreground truncate flex-1">{feed.title}</span>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant="outline" disabled={saving}>Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSaveEdit} disabled={saving} className="gap-2">
                                {saving && <Spinner className="h-4 w-4" />}
                                Save Changes
                            </Button>
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
                            toast.loading("Importing articles...", { id: "saveRss" });
                            const res = await SaveRssToArticles({ siteId, rssId: myFeeds.find((f: any) => f.url === feed?.feedUrl)?.id })
                            toast.success(res.message || "Imported!", { id: "saveRss" });
                            setLoading(false)
                        } catch (err: any) {
                            setLoading(false)
                            toast.error(err.message || "Failed to import", { id: "saveRss" });
                        }
                    }}
                    className="gap-2"
                >
                    {loading ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                    Import Articles
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenDelete(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    Delete Feed
                </Button>
            </div>

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
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
        <div className="min-h-screen bg-background">
            {/* Header skeleton */}
            <header className="sticky top-0 left-0 bg-background/95 backdrop-blur-sm z-10 border-b">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-muted animate-pulse" />
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-32 rounded-md" />
                </div>
            </header>

            <main className="p-5 lg:p-8">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                    {/* Feed items skeleton */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-7 w-28" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>

                        {/* Loading message */}
                        <div className="text-center py-8">
                            <p className="text-lg font-semibold text-foreground mb-2">
                                Feed is generating, please wait.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This could take more than 20 seconds.
                            </p>
                        </div>

                        {/* Feed item skeletons */}
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="overflow-hidden border-l-4 border-l-muted">
                                    <CardContent className="p-5 space-y-4">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="aspect-video w-full rounded-lg" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-5/6" />
                                            <Skeleton className="h-3 w-4/5" />
                                        </div>
                                        <div className="flex items-center gap-3 pt-2 border-t">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar skeleton */}
                    <div className="hidden lg:block lg:w-80 shrink-0 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <Skeleton className="h-5 w-24" />
                            </CardHeader>
                            <CardContent className="pt-0 space-y-4">
                                <Skeleton className="h-16 w-full rounded-lg" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}