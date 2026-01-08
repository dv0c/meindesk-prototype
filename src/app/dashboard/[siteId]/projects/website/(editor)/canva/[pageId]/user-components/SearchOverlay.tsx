"use client"

import * as React from "react"
import { Search as SearchIcon, X, FileText, Box, ShoppingBag, ArrowRight, Zap, Loader2 } from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getItems } from "@/lib/actions/item-actions"
import { getCollections } from "@/lib/actions/collection-actions"
import { getArticles } from "@/lib/actions/article-actions"


interface SearchItem {
    id: string
    title: string
    category: string
    slug: string
    icon: any
}

interface SearchOverlayProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    collections?: string[]
    siteId: string
    theme?: "light" | "dark"
}

export function SearchOverlay({ open, onOpenChange, collections = [], siteId, theme = "light" }: SearchOverlayProps) {
    const [query, setQuery] = React.useState("")
    const [items, setItems] = React.useState<SearchItem[]>([])
    const [loading, setLoading] = React.useState(false)

    // Fetch items when open or collections change
    React.useEffect(() => {
        if (!open || !siteId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // Determine which collection IDs to fetch
                let targetCollectionIds = collections

                // If no specific collections selected, fetch ALL collections for the site
                if (collections.length === 0) {
                    const colRes = await getCollections(siteId)
                    if (colRes.collections) {
                        targetCollectionIds = colRes.collections.map(c => c.id)
                    }
                }

                // Fetch items for each collection
                // In a production app, we would have a dedicated searchable endpoint or use Algolia
                // For this prototype, we'll fetch items concurrently
                const promises = targetCollectionIds.map(async (colId) => {
                    // Special handling for "Articles"
                    if (colId === "Articles") {
                        const res = await getArticles(siteId)
                        if (res.articles) {
                            return {
                                colId: "Articles",
                                items: res.articles.map((a: any) => ({
                                    id: a.id,
                                    data: { title: a.title }, // Normalize to match collection items structure roughly
                                    slug: a.slug,
                                    category: "Articles"
                                }))
                            }
                        }
                        return { colId: "Articles", items: [] }
                    }

                    const res = await getItems(colId)

                    // We also need the collection name for the category
                    // Optimization: We could pass the names down or fetch them once, 
                    // but getItems returns items which have collectionId, so we might need to map it back if we don't have the name.
                    // Actually getItems doesn't return collection name attached usually unless we include it.
                    // So we probably want to fetch the collection details or assume we have the map.

                    // Let's rely on the fact that we can get collection details.

                    // IMPROVEMENT: getItems usually returns simple items. We might check if it includes collection.
                    // Looking at the action, it does NOT include collection name by default in the list return.
                    // So we probably want to fetch the collection details or assume we have the map.

                    // Let's cheat slightly and just use collectionId as category temporarily or 
                    // implement a smarter fetch.
                    // Actually, let's just make sure we display something reasonable.

                    return {
                        colId,
                        items: res.items || []
                    }
                })

                const results = await Promise.all(promises)

                // We need collection names to display as categories.
                // Let's fetch all collections once to build a map
                const allCollectionsRes = await getCollections(siteId)
                const colMap = new Map(allCollectionsRes.collections?.map(c => [c.id, c.name]) || [])
                // Add virtual collection for Articles
                colMap.set("Articles", "Articles")

                const iconMap: Record<string, any> = {
                    'Articles': FileText,
                    'Products': ShoppingBag,
                    'Documentation': Box
                }

                const allItems: SearchItem[] = []
                results.forEach(({ colId, items }) => {
                    const categoryName = colMap.get(colId) || "Other"

                    items.forEach((item: any) => {
                        // Determine title
                        const title = item.data.title || item.data.name || item.slug || "Untitled"

                        allItems.push({
                            id: item.id,
                            title,
                            category: categoryName,
                            slug: item.slug,
                            icon: iconMap[categoryName] || FileText // Default icon
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
    }, [open, collections, siteId])

    // Filter items based on search query
    // Command component handles filtering automatically if we pass the items to it, 
    // but we can also pre-filter or rely on Command's fuzzy search.
    // Command's client-side filtering is good for < 1000 items.

    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, typeof items>)

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <div className={cn("flex flex-col h-full bg-background/95 backdrop-blur-sm", theme === "dark" ? "dark" : "")}>
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
                            <span>Powered by <strong>Meindesk</strong></span>
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
