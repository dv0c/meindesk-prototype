"use client"

import React, { useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import { useCollectionItem } from "./CollectionItemContext"

interface CollectionFieldDef {
    name: string
    type: string
    label: string
}

export interface RelatedItemsProps {
    // Which collection to search for related items
    relatedCollectionId?: string
    // The field in that collection that points to the current item
    relationFieldName?: string
    // Display options
    layout?: "grid" | "list" | "cards"
    columns?: 2 | 3 | 4
    limit?: number
    title?: string
    showImage?: boolean
    imageField?: string
    titleField?: string

    style?: BlockStyle
    className?: string
}

export const RelatedItems = defineBlock<RelatedItemsProps>({
    name: "RelatedItems",
    category: "Collections",
    icon: <div className="p-1">🔗</div>,

    defaultProps: {
        relatedCollectionId: "",
        relationFieldName: "",
        layout: "grid",
        columns: 3,
        limit: 6,
        title: "Related Items",
        showImage: true,
        imageField: "",
        titleField: "",
        style: {}
    },

    settingsConfig: {
        // Data Section
        relatedCollectionId: {
            label: "Related Collection",
            type: "collection-select",
            section: "Data",
            description: "Collection to find related items from"
        },
        relationFieldName: {
            label: "Relation Field Name",
            type: "text",
            section: "Data",
            description: "The field that points to this item (e.g., 'author')"
        },
        limit: {
            label: "Max Items",
            type: "slider",
            min: 1,
            max: 20,
            section: "Data",
        },

        // Display Section
        title: {
            label: "Section Title",
            type: "text",
            section: "Display",
        },
        layout: {
            label: "Layout",
            type: "select",
            section: "Display",
            options: [
                { label: "Grid", value: "grid" },
                { label: "Cards", value: "cards" },
                { label: "List", value: "list" },
            ],
        },
        columns: {
            label: "Columns",
            type: "select",
            section: "Display",
            options: [
                { label: "2", value: 2 },
                { label: "3", value: 3 },
                { label: "4", value: 4 },
            ],
        },
        showImage: {
            label: "Show Images",
            type: "checkbox",
            section: "Display",
        },
        imageField: {
            label: "Image Field",
            type: "text",
            section: "Display",
            description: "Leave empty to auto-detect"
        },
        titleField: {
            label: "Title Field",
            type: "text",
            section: "Display",
            description: "Leave empty to auto-detect"
        },
    },

    render: ({
        relatedCollectionId = "",
        relationFieldName = "",
        layout = "grid",
        columns = 3,
        limit = 6,
        title = "Related Items",
        showImage = true,
        imageField = "",
        titleField = "",
        style,
        className = "",
    }) => {
        const [items, setItems] = useState<any[]>([])
        const [collection, setCollection] = useState<{ name: string; slug: string; fields: CollectionFieldDef[] } | null>(null)
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)

        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')

        // Get current item from context (provided by parent CollectionItem)
        const currentItem = useCollectionItem()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        useEffect(() => {
            if (!team?.id || !relatedCollectionId || !relationFieldName || !currentItem?.id) {
                setLoading(false)
                return
            }

            const controller = new AbortController()
            const loadRelatedItems = async () => {
                try {
                    setLoading(true)
                    setError(null)

                    // First, we need to find what collection the current item belongs to
                    // We'll get this from the collection lookup
                    const collectionResponse = await axios.get(
                        `/api/dashboard/${team.id}/collections`,
                        { signal: controller.signal }
                    )

                    // Find the collection that contains the current item
                    // For now, we'll use a workaround - fetch items from related collection
                    // and filter by the relation field
                    const { data } = await axios.get(
                        `/api/v1/${team.id}/collections/${relatedCollectionId}/items?limit=${limit * 2}`,
                        { signal: controller.signal }
                    )

                    setCollection(data.collection)

                    // Filter items that reference the current item
                    const matchingItems = (data.items || []).filter((item: any) => {
                        const relationValue = item.data?.[relationFieldName]
                        if (!relationValue) return false

                        if (Array.isArray(relationValue)) {
                            return relationValue.includes(currentItem.id)
                        }
                        return relationValue === currentItem.id
                    }).slice(0, limit)

                    setItems(matchingItems)
                } catch (err: any) {
                    if (axios.isCancel(err)) return
                    console.error("Failed to load related items:", err)
                    setError("Failed to load related items")
                } finally {
                    setLoading(false)
                }
            }

            loadRelatedItems()
            return () => controller.abort()
        }, [team?.id, relatedCollectionId, relationFieldName, currentItem?.id, limit])

        // Field helpers
        const getImageField = () => {
            if (imageField) return imageField
            const imgField = collection?.fields?.find(f => f.type === 'image')
            return imgField?.name || ''
        }

        const getTitleField = () => {
            if (titleField) return titleField
            const textFields = collection?.fields?.filter(f => f.type === 'text') || []
            const titleCandidate = textFields.find(f =>
                f.name.toLowerCase().includes('title') ||
                f.name.toLowerCase().includes('name')
            )
            return titleCandidate?.name || textFields[0]?.name || ''
        }

        // Loading skeleton
        if (loading || teamLoading) {
            return (
                <div className={cn("space-y-4", computedClassName)} style={computedStyle}>
                    {title && <h3 className="text-lg font-semibold">{title}</h3>}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
                            <div key={i} className="border border-border bg-card p-4 space-y-3">
                                {showImage && <div className="aspect-video bg-muted animate-pulse" />}
                                <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        // Not inside a CollectionItem context
        if (!currentItem) {
            return (
                <div className={cn("border-2 border-dashed border-border p-6 text-center", computedClassName)} style={computedStyle}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        Place inside a CollectionItem component
                    </p>
                </div>
            )
        }

        // Missing configuration
        if (!relatedCollectionId || !relationFieldName) {
            return (
                <div className={cn("border-2 border-dashed border-border p-6 text-center", computedClassName)} style={computedStyle}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        Configure related collection and field in settings
                    </p>
                </div>
            )
        }

        // Error state
        if (error) {
            return (
                <div className={cn("border border-destructive/50 bg-destructive/5 p-6 text-center", computedClassName)} style={computedStyle}>
                    <p className="text-destructive font-mono text-sm">{error}</p>
                </div>
            )
        }

        // No related items
        if (!items.length) {
            return (
                <div className={cn("space-y-4", computedClassName)} style={computedStyle}>
                    {title && <h3 className="text-lg font-semibold">{title}</h3>}
                    <p className="text-muted-foreground text-sm">No related items found</p>
                </div>
            )
        }

        const imgField = getImageField()
        const ttlField = getTitleField()
        const collectionSlug = collection?.slug || ''

        return (
            <div className={cn("space-y-4", computedClassName)} style={computedStyle}>
                {title && <h3 className="text-lg font-semibold">{title}</h3>}

                {/* Grid/Cards Layout */}
                {(layout === "grid" || layout === "cards") && (
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {items.map((item) => {
                            const imageUrl = imgField ? item.data?.[imgField] : null
                            const itemTitle = ttlField ? item.data?.[ttlField] : item.slug

                            return (
                                <Link
                                    key={item.id}
                                    href={`/c/${collectionSlug}/${item.slug}`}
                                    className={cn(
                                        "border border-border bg-card overflow-hidden transition-all hover:border-primary/50",
                                        layout === "cards" && "rounded-lg shadow-sm hover:shadow-md"
                                    )}
                                >
                                    {showImage && imageUrl && (
                                        <div className="aspect-video overflow-hidden bg-muted">
                                            <img
                                                src={imageUrl}
                                                alt={String(itemTitle)}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h4 className="font-medium text-foreground line-clamp-2">
                                            {itemTitle}
                                        </h4>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* List Layout */}
                {layout === "list" && (
                    <div className="space-y-2">
                        {items.map((item) => {
                            const imageUrl = imgField ? item.data?.[imgField] : null
                            const itemTitle = ttlField ? item.data?.[ttlField] : item.slug

                            return (
                                <Link
                                    key={item.id}
                                    href={`/c/${collectionSlug}/${item.slug}`}
                                    className="flex items-center gap-4 p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                                >
                                    {showImage && imageUrl && (
                                        <div className="w-16 h-12 flex-shrink-0 overflow-hidden bg-muted rounded">
                                            <img
                                                src={imageUrl}
                                                alt={String(itemTitle)}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <span className="font-medium text-foreground">
                                        {itemTitle}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }
})

export default RelatedItems
