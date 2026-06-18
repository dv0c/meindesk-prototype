"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search as SearchIcon, ArrowRight, Zap, Loader2, Box, FileText, ShoppingBag } from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { getItems } from "@/lib/actions/item-actions"
import { getCollections } from "@/lib/actions/collection-actions"
import { getArticles } from "@/lib/actions/article-actions"
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker"

interface SearchItem {
    id: string
    title: string
    category: string
    slug: string
    href?: string // Added href to SearchItem
    icon: any
}

interface SearchOverlayProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    collections?: string[]
    siteId: string
    theme?: "light" | "dark"
    layout?: "minimal" | "dashboard" | "classic" | "modern"
}

export function SearchOverlay({ open, onOpenChange, collections = [], siteId, theme = "light", layout = "minimal" }: SearchOverlayProps) {
    const [query, setQuery] = React.useState("")
    const [items, setItems] = React.useState<SearchItem[]>([])
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    // Fetch items when mounted (Preload) or siteId changes
    React.useEffect(() => {
        if (!siteId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch all collections first to get slugs/names
                const allCollectionsRes = await getCollections(siteId)

                const colMap = new Map<string, { name: string, slug: string }>()

                if (allCollectionsRes.collections) {
                    allCollectionsRes.collections.forEach(c => {
                        colMap.set(c.id, { name: c.name, slug: c.slug })
                    })
                }
                colMap.set("Articles", { name: "Articles", slug: "articles" })

                // Determine which collection IDs to fetch items from
                let targetCollectionIds = collections

                if (collections.length === 0) {
                    targetCollectionIds = Array.from(colMap.keys())
                }

                // Fetch items
                const promises = targetCollectionIds.map(async (colId) => {
                    // Special handling for "Articles"
                    if (colId === "Articles") {
                        const res = await getArticles(siteId)
                        if (res.articles) {
                            return {
                                colId: "Articles",
                                items: res.articles.map((a: any) => ({
                                    id: a.id,
                                    data: { title: a.title },
                                    slug: a.slug,
                                    category: "Articles"
                                }))
                            }
                        }
                        return { colId: "Articles", items: [] }
                    }

                    const res = await getItems(colId)
                    return {
                        colId,
                        items: res.items || []
                    }
                })

                const results = await Promise.all(promises)

                // Virtual "Articles" collection map entry
                // colMap.set("Articles", { name: "Articles", slug: "articles" }) 

                const iconMap: Record<string, any> = {
                    'Articles': FileText,
                    'Products': ShoppingBag,
                    'Documentation': Box
                }

                const allItems: SearchItem[] = []
                results.forEach(({ colId, items }) => {
                    const colDetails = colMap.get(colId)

                    const categoryName = colDetails?.name || (colId === "Articles" ? "Articles" : "Other")
                    const collectionSlug = colDetails?.slug

                    items.forEach((item: any) => {
                        const title = item.data.title || item.data.name || item.slug || "Untitled"

                        // Construct URL
                        let href = "#"
                        if (categoryName === "Articles") {
                            href = `/article/${item.slug}`
                        } else if (collectionSlug) {
                            href = `/c/${collectionSlug}/${item.slug}`
                        }

                        allItems.push({
                            id: item.id,
                            title,
                            category: categoryName,
                            slug: item.slug,
                            href, // Add href to item
                            icon: iconMap[categoryName] || FileText
                        })
                    })
                })

                setItems(allItems)
            } catch (error) {
                console.error("Failed to fetch search items", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [siteId, collections])

    const layoutClass =
        layout === "dashboard"
            ? "rounded-xl border border-border/70"
            : layout === "classic"
                ? "rounded-none border-y"
                : layout === "modern"
                    ? "rounded-2xl border border-border/40 shadow-2xl"
                    : ""

    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, typeof items>)

    const handleSelect = (item: SearchItem) => {
        setQuery("")
        onOpenChange(false)
        if (item.href && item.href !== "#") {
            router.push(item.href)
        }
    }

    const filteredCount = React.useMemo(() => {
        if (!query.trim()) return items.length
        const q = query.trim().toLowerCase()
        return items.filter((item) => item.title.toLowerCase().includes(q)).length
    }, [items, query])

    React.useEffect(() => {
        if (!siteId || !query.trim() || query.trim().length < 2) return

        const timer = window.setTimeout(() => {
            void trackAnalyticsEvent(siteId, "search", {
                query: query.trim(),
                resultsCount: filteredCount,
            })
        }, 400)

        return () => window.clearTimeout(timer)
    }, [siteId, query, filteredCount])

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <div className={cn("flex flex-col h-full bg-background/95 backdrop-blur-sm", theme === "dark" ? "dark" : "", layoutClass)}>
                <div className="flex items-center border-b px-4 transition-colors focus-within:border-primary/50">
                    <SearchIcon className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                    <CommandInput
                        placeholder="What are you looking for?"
                        value={query}
                        onValueChange={setQuery}
                        className="flex-1 h-16 text-lg bg-transparent outline-none placeholder:text-muted-foreground/50 border-none focus:ring-0"
                    />
                    {loading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
                </div>

                <CommandList className="flex-1 max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
                    <CommandEmpty className="py-10 text-center text-muted-foreground">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                                <p className="text-sm">Fetching results...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Box className="h-10 w-10 opacity-20" />
                                <p>No results found.</p>
                                <p className="text-xs text-muted-foreground/70">Try searching for articles, collections, or products.</p>
                            </div>
                        )}
                    </CommandEmpty>

                    {!loading && Object.entries(groupedItems).map(([category, items]) => (
                        <CommandGroup key={category} heading={category} className="text-muted-foreground/70">
                            {items.map(item => (
                                <CommandItem
                                    key={item.id}
                                    value={`${item.title} ${category}`}
                                    onSelect={() => handleSelect(item)}
                                    className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm aria-selected:bg-primary/5 aria-selected:text-primary cursor-pointer transition-all"
                                >
                                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted/50 group-aria-selected:bg-primary/10 group-aria-selected:text-primary transition-colors">
                                        <item.icon className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1 flex flex-col gap-0.5">
                                        <span className="font-medium text-foreground group-aria-selected:text-primary">{item.title}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category}</span>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-muted-foreground bg-background border px-1.5 py-0.5 rounded shadow-sm">Jump to</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}

                    {!loading && items.length === 0 && query === "" && (
                        <div className="py-12 text-center opacity-50">
                            <p className="text-sm">Type to start searching...</p>
                        </div>
                    )}
                </CommandList>

                <div className="px-4 py-3 border-t bg-muted/10 backdrop-blur-md flex items-center justify-between text-[11px] text-muted-foreground select-none">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Zap className="h-3 w-3 fill-yellow-500/50 text-yellow-600" />
                            <span>Powered by <strong>Prototype</strong></span>
                        </div>
                        {items.length > 0 && <span><strong>{items.length}</strong> results</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium opacity-100">
                                <span className="text-xs">↑</span>
                            </kbd>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium opacity-100">
                                <span className="text-xs">↓</span>
                            </kbd>
                            <span>to navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium opacity-100">
                                <span className="text-xs">Esc</span>
                            </kbd>
                            <span>to close</span>
                        </span>
                    </div>
                </div>
            </div>
        </CommandDialog>
    )
}
