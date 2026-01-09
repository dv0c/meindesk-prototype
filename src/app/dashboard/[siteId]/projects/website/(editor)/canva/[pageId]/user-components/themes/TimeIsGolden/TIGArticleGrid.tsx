"use client"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useTeam } from "@/hooks/useTeam"
import { getCollections } from "@/lib/actions/collection-actions"
import { BlockStyle, defineBlock, useBlockStyles } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import { useNode } from "@craftjs/core"
import axios from "axios"
import { Check, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { PropertyRow, PropertySection, PropertySlider } from "../../../components/PropertySection"

// --- Types ---

interface CollectionItem {
    id: string
    slug: string
    status: string
    data: Record<string, any>
    createdAt: string
    updatedAt: string
}

export interface TIGArticleGridProps {
    collectionId?: string
    limit?: number
    showImage?: boolean
    style?: BlockStyle
    className?: string
}

// --- Component ---

export const TIGArticleGrid = defineBlock<TIGArticleGridProps>({
    name: "TIG Grid",
    category: "Time is Golden",
    icon: <div className="p-1 border rounded bg-muted/20">Grid</div>,

    defaultProps: {
        collectionId: "",
        limit: 9,
        showImage: true,
        style: {
            width: "100%",
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
        }
    },

    settings: () => {
        const {
            actions: { setProp },
            collectionId,
            limit,
            showImage
        } = useNode((node) => ({
            collectionId: node.data.props.collectionId,
            limit: node.data.props.limit,
            showImage: node.data.props.showImage,
        }))

        const params = useParams()
        const siteId = (params.tenantId as string) || (params.siteId as string)
        const [availableCollections, setAvailableCollections] = useState<{ label: string, value: string }[]>([])
        const [openCombobox, setOpenCombobox] = useState(false)

        useEffect(() => {
            if (!siteId) return
            const fetchCollections = async () => {
                const res = await getCollections(siteId)
                const options = [
                    { label: "Articles", value: "Articles" }
                ]
                if (res.collections) {
                    res.collections.forEach(c => {
                        options.push({ label: c.name, value: c.id })
                    })
                }
                setAvailableCollections(options)
            }
            fetchCollections()
        }, [siteId])

        const selectedLabel = availableCollections.find(c => c.value === collectionId)?.label || collectionId

        return (
            <div className="space-y-4">
                <PropertySection title="Data Source">
                    <div className="space-y-2 mt-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Collection</label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <button
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-background hover:bg-muted/50 transition-colors"
                                >
                                    <span className="text-muted-foreground truncate">
                                        {collectionId ? selectedLabel : "Select collection..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search collections..." />
                                    <CommandList>
                                        <CommandEmpty>No collection found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableCollections.map((collection) => (
                                                <CommandItem
                                                    key={collection.value}
                                                    value={collection.label}
                                                    onSelect={() => {
                                                        setProp((props: any) => props.collectionId = collection.value)
                                                        setOpenCombobox(false)
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        collectionId === collection.value
                                                            ? "bg-primary text-primary-foreground"
                                                            : "opacity-50 [&_svg]:invisible"
                                                    )}>
                                                        <Check className={cn("h-4 w-4")} />
                                                    </div>
                                                    {collection.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <PropertyRow label="Count">
                        <PropertySlider
                            value={limit || 9}
                            onChange={(v) => setProp((props: any) => props.limit = v)}
                            min={1}
                            max={20}
                        />
                    </PropertyRow>
                </PropertySection>

                <PropertySection title="Display">
                    <PropertyRow label="Show Image">
                        <Switch
                            checked={showImage}
                            onCheckedChange={(v) => setProp((props: any) => props.showImage = v)}
                        />
                    </PropertyRow>
                </PropertySection>
            </div>
        )
    },

    render: ({ collectionId, limit, showImage, style, className }) => {
        const [items, setItems] = useState<CollectionItem[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')

        // useBlockStyles hook for styles
        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className: cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12", className)
        })

        useEffect(() => {
            if (!team?.id || !collectionId) {
                if ((collectionId === "Articles" || collectionId === "articles") && team?.id) {
                    // Proceed
                } else {
                    setLoading(false)
                    return
                }
            }

            const controller = new AbortController()
            const loadItems = async () => {
                try {
                    setLoading(true)
                    setError(null)

                    let endpoint = `/api/v1/${team.id}/collections/${collectionId}/items?limit=${limit}`

                    // Handle "articles" special collection
                    if (collectionId === "articles" || collectionId === "Articles") {
                        endpoint = `/api/v1/${team.id}/articles?limit=${limit}&status=PUBLISHED`
                    }

                    const { data } = await axios.get(endpoint, { signal: controller.signal })

                    let fetchedItems = data.items || data.articles || data || []

                    // Map Articles to CollectionItem format if needed
                    if (collectionId === "articles" || collectionId === "Articles") {
                        fetchedItems = fetchedItems.map((article: any) => ({
                            id: article.id,
                            slug: article.slug,
                            status: article.status,
                            createdAt: article.createdAt,
                            updatedAt: article.updatedAt,
                            data: {
                                title: article.title,
                                description: article.description || article.excerpt,
                                image: article.coverImage || article.image,
                                ...article
                            }
                        }))
                    }

                    setItems(fetchedItems)
                } catch (err: any) {
                    if (axios.isCancel(err)) return
                    console.error("Failed to load items:", err)
                    setError("Failed to load items")
                } finally {
                    setLoading(false)
                }
            }

            if (team?.id) {
                loadItems()
            }
            return () => controller.abort()
        }, [team?.id, collectionId, limit])


        const renderItem = (item: CollectionItem, index: number) => {
            // Magazine Logic: First item is featured (larger)
            const isFeatured = index === 0
            const title = item.data.title || item.data.name || item.slug
            const image = item.data.image || item.data.coverImage || item.data.cover
            const excerpt = item.data.description || item.data.excerpt || ""

            return (
                <Link
                    key={item.id}
                    href={`/article/${item.slug}`}
                    className={cn(
                        "group block overflow-hidden",
                        isFeatured ? "md:col-span-2 lg:col-span-2 row-span-2" : "col-span-1"
                    )}
                >
                    <div className="h-full flex flex-col gap-4">
                        {showImage && image && (
                            <div className={cn(
                                "relative overflow-hidden bg-muted",
                                isFeatured ? "aspect-[16/9]" : "aspect-[4/3]"
                            )}>
                                <img
                                    src={image}
                                    alt={title}
                                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                                {item.data.category || "Story"}
                            </span>

                            <h3 className={cn(
                                "font-serif font-bold text-foreground leading-tight group-hover:underline decoration-1 underline-offset-4",
                                isFeatured ? "text-3xl md:text-4xl" : "text-xl"
                            )}>
                                {title}
                            </h3>

                            {excerpt && (
                                <p className={cn(
                                    "text-muted-foreground font-serif",
                                    isFeatured ? "text-lg line-clamp-3" : "text-sm line-clamp-2"
                                )}>
                                    {excerpt}
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            )
        }

        if (loading || teamLoading) {
            return (
                <div style={computedStyle} className={computedClassName}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4 animate-pulse">
                            <div className="bg-muted aspect-video w-full" />
                            <div className="h-6 bg-muted w-3/4" />
                            <div className="h-4 bg-muted w-full" />
                        </div>
                    ))}
                </div>
            )
        }

        if (error) return <div style={computedStyle} className={computedClassName}>Error loading items.</div>
        if (!items.length) return <div style={computedStyle} className={computedClassName + " p-8 border border-dashed text-center text-muted-foreground"}>Select a collection to display items.</div>

        return (
            <div style={computedStyle} className={computedClassName}>
                {items.map((item, i) => renderItem(item, i))}
            </div>
        )
    }
})
