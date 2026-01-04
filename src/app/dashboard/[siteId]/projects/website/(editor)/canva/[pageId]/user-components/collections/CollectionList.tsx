"use client"

import React, { forwardRef, useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../lib/withCraftComponent"
import { cn } from "@/lib/utils"

interface CollectionItem {
    id: string
    slug: string
    status: string
    data: Record<string, any>
    createdAt: string
    updatedAt: string
}

interface CollectionField {
    name: string
    type: string
    label: string
    required?: boolean
    relatedCollectionId?: string
    relationType?: string
}

interface CollectionListProps extends CraftComponentProps {
    collectionId?: string
    layout?: "grid" | "list" | "cards"
    columns?: 2 | 3 | 4
    limit?: number
    showImage?: boolean
    imageField?: string
    titleField?: string
    descriptionField?: string
    linkToDetail?: boolean
    detailPagePath?: string
}

const CollectionListBase = forwardRef<HTMLDivElement, CollectionListProps>(
    (
        {
            collectionId = "",
            layout = "grid",
            columns = 3,
            limit = 12,
            showImage = true,
            imageField = "",
            titleField = "",
            descriptionField = "",
            linkToDetail = true,
            detailPagePath = "/item",
            className = "",
        },
        ref
    ) => {
        const [items, setItems] = useState<CollectionItem[]>([])
        const [collection, setCollection] = useState<{ name: string; slug: string; fields: CollectionField[] } | null>(null)
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')

        useEffect(() => {
            if (!team?.id || !collectionId) {
                setLoading(false)
                return
            }

            const controller = new AbortController()
            const loadItems = async () => {
                try {
                    setLoading(true)
                    setError(null)
                    const { data } = await axios.get(
                        `/api/v1/${team.id}/collections/${collectionId}/items?limit=${limit}`,
                        { signal: controller.signal }
                    )
                    setCollection(data.collection)
                    setItems(data.items || [])
                } catch (err: any) {
                    if (axios.isCancel(err)) return
                    console.error("Failed to load collection items:", err)
                    setError("Failed to load items")
                } finally {
                    setLoading(false)
                }
            }

            loadItems()
            return () => controller.abort()
        }, [team?.id, collectionId, limit])

        // Auto-detect fields if not specified
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

        const getDescriptionField = () => {
            if (descriptionField) return descriptionField
            const textFields = collection?.fields?.filter(f => f.type === 'text' || f.type === 'richtext') || []
            const descCandidate = textFields.find(f =>
                f.name.toLowerCase().includes('description') ||
                f.name.toLowerCase().includes('excerpt') ||
                f.name.toLowerCase().includes('summary')
            )
            return descCandidate?.name || ''
        }

        // Render helpers
        const getItemValue = (item: CollectionItem, fieldName: string) => {
            return item.data?.[fieldName] || null
        }

        const renderFieldValue = (value: any, fieldType?: string) => {
            if (value === null || value === undefined) return null

            if (Array.isArray(value)) {
                return value.join(', ')
            }

            if (typeof value === 'boolean') {
                return value ? 'Yes' : 'No'
            }

            if (typeof value === 'object') {
                // Resolved relation
                return value.title || value.name || value.slug || JSON.stringify(value)
            }

            return String(value)
        }

        // Loading skeleton
        if (loading || teamLoading) {
            return (
                <div ref={ref} className={cn("grid gap-4", className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
                        <div key={i} className="border border-border bg-card p-4 space-y-3">
                            {showImage && <div className="aspect-video bg-muted animate-pulse" />}
                            <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                            <div className="h-4 bg-muted animate-pulse rounded w-full" />
                            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                        </div>
                    ))}
                </div>
            )
        }

        // Empty state - no collection selected
        if (!collectionId) {
            return (
                <div ref={ref} className={cn("border-2 border-dashed border-border p-8 text-center", className)}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        Select a collection in the settings panel
                    </p>
                </div>
            )
        }

        // Error state
        if (error) {
            return (
                <div ref={ref} className={cn("border border-destructive/50 bg-destructive/5 p-8 text-center", className)}>
                    <p className="text-destructive font-mono text-sm">{error}</p>
                </div>
            )
        }

        // Empty state - no items
        if (!items.length) {
            return (
                <div ref={ref} className={cn("border border-border p-8 text-center", className)}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        No items in this collection
                    </p>
                </div>
            )
        }

        const imgField = getImageField()
        const ttlField = getTitleField()
        const descField = getDescriptionField()

        // Auto-generate detail page path using collection slug
        const getDetailLink = (itemSlug: string) => {
            if (detailPagePath && detailPagePath !== '/item') {
                // User specified a custom path
                return `${detailPagePath}/${itemSlug}`
            }
            // Use /c/collection-slug/item-slug format
            return `/c/${collection?.slug || 'item'}/${itemSlug}`
        }

        // Grid layout
        if (layout === "grid" || layout === "cards") {
            return (
                <div
                    ref={ref}
                    className={cn("grid gap-4", className)}
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {items.map((item) => {
                        const imageUrl = imgField ? getItemValue(item, imgField) : null
                        const title = ttlField ? getItemValue(item, ttlField) : item.slug
                        const description = descField ? getItemValue(item, descField) : null

                        const content = (
                            <div className={cn(
                                "border border-border bg-card overflow-hidden transition-all",
                                layout === "cards" && "rounded-lg shadow-sm hover:shadow-md",
                                linkToDetail && "cursor-pointer hover:border-primary/50"
                            )}>
                                {showImage && imageUrl && (
                                    <div className="aspect-video overflow-hidden bg-muted">
                                        <img
                                            src={imageUrl}
                                            alt={String(title)}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground line-clamp-2">
                                        {renderFieldValue(title)}
                                    </h3>
                                    {description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {renderFieldValue(description)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )

                        if (linkToDetail) {
                            return (
                                <Link key={item.id} href={getDetailLink(item.slug)}>
                                    {content}
                                </Link>
                            )
                        }

                        return <div key={item.id}>{content}</div>
                    })}
                </div>
            )
        }

        // List layout
        return (
            <div ref={ref} className={cn("space-y-4", className)}>
                {items.map((item) => {
                    const imageUrl = imgField ? getItemValue(item, imgField) : null
                    const title = ttlField ? getItemValue(item, ttlField) : item.slug
                    const description = descField ? getItemValue(item, descField) : null

                    const content = (
                        <div className={cn(
                            "flex gap-4 border-b border-border pb-4 last:border-0",
                            linkToDetail && "cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
                        )}>
                            {showImage && imageUrl && (
                                <div className="w-32 h-24 flex-shrink-0 overflow-hidden bg-muted">
                                    <img
                                        src={imageUrl}
                                        alt={String(title)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground line-clamp-1">
                                    {renderFieldValue(title)}
                                </h3>
                                {description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {renderFieldValue(description)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )

                    if (linkToDetail) {
                        return (
                            <Link key={item.id} href={getDetailLink(item.slug)}>
                                {content}
                            </Link>
                        )
                    }

                    return <div key={item.id}>{content}</div>
                })}
            </div>
        )
    }
)

CollectionListBase.displayName = "CollectionListBase"

// Default props
const defaultProps: Partial<CollectionListProps> = {
    collectionId: "",
    layout: "grid",
    columns: 3,
    limit: 12,
    showImage: true,
    imageField: "",
    titleField: "",
    descriptionField: "",
    linkToDetail: true,
    detailPagePath: "/item",
}

// Wrap with CraftJS functionality
export const CollectionList = withCraftComponent<CollectionListProps, HTMLDivElement>(
    CollectionListBase,
    {
        displayName: "CollectionList",
        defaultProps,
        sectionTitle: "Collection List",
        settingsConfig: {
            // Data Section
            collectionId: {
                label: "Collection",
                type: "collection-select",
                section: "Data",
            },
            limit: {
                label: "Items Limit",
                type: "slider",
                min: 1,
                max: 50,
                section: "Data",
            },

            // Layout Section
            layout: {
                label: "Layout Style",
                type: "select",
                section: "Layout",
                options: [
                    { label: "Grid", value: "grid" },
                    { label: "Cards", value: "cards" },
                    { label: "List", value: "list" },
                ],
            },
            columns: {
                label: "Columns",
                type: "select",
                section: "Layout",
                options: [
                    { label: "2 Columns", value: 2 },
                    { label: "3 Columns", value: 3 },
                    { label: "4 Columns", value: 4 },
                ],
            },

            // Display Section
            showImage: {
                label: "Show Image",
                type: "checkbox",
                section: "Display",
            },
            imageField: {
                label: "Image Field",
                type: "text",
                section: "Display",
            },
            titleField: {
                label: "Title Field",
                type: "text",
                section: "Display",
            },
            descriptionField: {
                label: "Description Field",
                type: "text",
                section: "Display",
            },

            // Links Section
            linkToDetail: {
                label: "Link to Detail Page",
                type: "checkbox",
                section: "Links",
            },
            detailPagePath: {
                label: "Custom Detail Path (optional)",
                type: "text",
                section: "Links",
                description: "Leave empty to use collection slug (e.g., /books/[slug])"
            },
        },
    }
)

export default CollectionList
