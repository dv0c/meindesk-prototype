"use client"

import React, { useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import { useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import { Database } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertySelect,
    PropertyInput,
    PropertyCheckbox,
    PropertySlider,
} from "../../components/PropertySection"

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
}

interface CollectionListProps {
    collectionId?: string
    layout?: "grid" | "list" | "cards"
    columns?: number
    limit?: number
    showImage?: boolean
    imageField?: string
    titleField?: string
    descriptionField?: string
    linkToDetail?: boolean
    detailPagePath?: string
    style?: BlockStyle
    className?: string
}

const defaultStyles: BlockStyle = {
    width: "100%",
    gap: 16
}

const CollectionListSettings = () => {
    const {
        actions: { setProp },
        collectionId,
        layout,
        columns,
        limit,
        showImage,
        imageField,
        titleField,
        descriptionField,
        linkToDetail,
        detailPagePath
    } = useNode((node) => ({
        collectionId: node.data.props.collectionId,
        layout: node.data.props.layout,
        columns: node.data.props.columns,
        limit: node.data.props.limit,
        showImage: node.data.props.showImage,
        imageField: node.data.props.imageField,
        titleField: node.data.props.titleField,
        descriptionField: node.data.props.descriptionField,
        linkToDetail: node.data.props.linkToDetail,
        detailPagePath: node.data.props.detailPagePath
    }))

    return (
        <div>
            <PropertySection title="Data Source">
                <PropertyRow label="Collection">
                    <PropertyInput
                        value={collectionId || ""}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.collectionId = v))}
                        placeholder="Collection ID"
                    />
                </PropertyRow>
                <PropertyRow label="Limit">
                    <PropertySlider
                        value={limit || 12}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.limit = v))}
                        min={1}
                        max={50}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Layout">
                <PropertyRow label="Style">
                    <PropertySelect
                        value={layout || "grid"}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.layout = v as any))}
                        options={[
                            { label: "Grid", value: "grid" },
                            { label: "Cards", value: "cards" },
                            { label: "List", value: "list" },
                        ]}
                    />
                </PropertyRow>
                {(layout === 'grid' || layout === 'cards') && (
                    <PropertyRow label="Columns">
                        <PropertySelect
                            value={String(columns || 3)}
                            onChange={(v) => setProp((props: CollectionListProps) => (props.columns = parseInt(v)))}
                            options={[
                                { label: "2 Columns", value: 2 },
                                { label: "3 Columns", value: 3 },
                                { label: "4 Columns", value: 4 },
                            ]}
                        />
                    </PropertyRow>
                )}
            </PropertySection>

            <PropertySection title="Display">
                <PropertyRow label="Show Image">
                    <PropertyCheckbox
                        checked={showImage !== false}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.showImage = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Image Field">
                    <PropertyInput
                        value={imageField || ""}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.imageField = v))}
                        placeholder="Auto"
                    />
                </PropertyRow>
                <PropertyRow label="Title Field">
                    <PropertyInput
                        value={titleField || ""}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.titleField = v))}
                        placeholder="Auto"
                    />
                </PropertyRow>
                <PropertyRow label="Desc Field">
                    <PropertyInput
                        value={descriptionField || ""}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.descriptionField = v))}
                        placeholder="Auto"
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Navigation">
                <PropertyRow label="Link to Detail">
                    <PropertyCheckbox
                        checked={linkToDetail !== false}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.linkToDetail = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Detail Path">
                    <PropertyInput
                        value={detailPagePath || ""}
                        onChange={(v) => setProp((props: CollectionListProps) => (props.detailPagePath = v))}
                        placeholder="/item/..."
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const CollectionList = defineBlock<CollectionListProps>({
    name: "CollectionList",
    category: "Data",
    icon: <Database className="w-4 h-4" />,
    description: "Display a list of items from a collection",

    defaultProps: {
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
        style: defaultStyles
    },

    settings: CollectionListSettings,

    render: ({
        collectionId,
        layout = "grid",
        columns = 3,
        limit = 12,
        showImage = true,
        imageField,
        titleField,
        descriptionField,
        linkToDetail = true,
        detailPagePath = "/item",
        style,
        className,
        theme
    }) => {
        const [items, setItems] = useState<CollectionItem[]>([])
        const [collection, setCollection] = useState<{ name: string; slug: string; fields: CollectionField[] } | null>(null)
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')

        const effectiveStyle = {
            ...style,
            width: "100%",
            display: (layout === "grid" || layout === "cards") ? "grid" : "block",
            gridTemplateColumns: (layout === "grid" || layout === "cards") ? `repeat(${columns}, 1fr)` : undefined,
            gap: (layout === "grid" || layout === "cards") ? (style?.gap ?? 16) : undefined
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: effectiveStyle,
            className
        })

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

        const getItemValue = (item: CollectionItem, fieldName: string) => {
            return item.data?.[fieldName] || null
        }

        const renderFieldValue = (value: any) => {
            if (value === null || value === undefined) return null
            if (Array.isArray(value)) return value.join(', ')
            if (typeof value === 'object') return value.title || value.name || value.slug || JSON.stringify(value)
            return String(value)
        }

        const getDetailLink = (itemSlug: string) => {
            if (detailPagePath && detailPagePath !== '/item') {
                return `${detailPagePath}/${itemSlug}`
            }
            return `/c/${collection?.slug || 'item'}/${itemSlug}`
        }

        const commonClasses = cn(computedClassName, "w-full")

        if (loading || teamLoading) {
            return (
                <div className={commonClasses} style={computedStyle}>
                    {Array.from({ length: Math.min(limit || 3, 3) }).map((_, i) => (
                        <div key={i} className="border border-border bg-card p-4 space-y-3 mb-4 last:mb-0">
                            {showImage && <div className="aspect-video bg-muted animate-pulse" />}
                            <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                            <div className="h-4 bg-muted animate-pulse rounded w-full" />
                        </div>
                    ))}
                </div>
            )
        }

        if (!collectionId) {
            return (
                <div className={cn("border-2 border-dashed border-border p-8 text-center", commonClasses)} style={{ ...computedStyle, display: 'block' }}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        Select a collection in settings
                    </p>
                </div>
            )
        }

        if (error) {
            return (
                <div className={cn("border border-destructive/50 bg-destructive/5 p-8 text-center", commonClasses)} style={{ ...computedStyle, display: 'block' }}>
                    <p className="text-destructive font-mono text-sm">{error}</p>
                </div>
            )
        }

        if (!items.length) {
            return (
                <div className={cn("border border-border p-8 text-center", commonClasses)} style={{ ...computedStyle, display: 'block' }}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        No items in this collection
                    </p>
                </div>
            )
        }

        const imgField = getImageField()
        const ttlField = getTitleField()
        const descField = getDescriptionField()

        const renderItemContent = (item: CollectionItem) => {
            const imageUrl = imgField ? getItemValue(item, imgField) : null
            const title = ttlField ? getItemValue(item, ttlField) : item.slug
            const description = descField ? getItemValue(item, descField) : null

            if (layout === "list") {
                return (
                    <div className={cn(
                        "flex gap-4 border-b border-border pb-4 last:border-0",
                        linkToDetail && "cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
                    )}>
                        {showImage && imageUrl && (
                            <div className="w-32 h-24 flex-shrink-0 overflow-hidden bg-muted">
                                <img src={imageUrl} alt={String(title)} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground line-clamp-1">{renderFieldValue(title)}</h3>
                            {description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{renderFieldValue(description)}</p>
                            )}
                        </div>
                    </div>
                )
            }

            // Grid or Cards
            return (
                <div className={cn(
                    "border border-border bg-card overflow-hidden transition-all",
                    layout === "cards" && "rounded-lg shadow-sm hover:shadow-md",
                    linkToDetail && "cursor-pointer hover:border-primary/50"
                )}>
                    {showImage && imageUrl && (
                        <div className="aspect-video overflow-hidden bg-muted">
                            <img src={imageUrl} alt={String(title)} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-foreground line-clamp-2">{renderFieldValue(title)}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{renderFieldValue(description)}</p>
                        )}
                    </div>
                </div>
            )
        }

        return (
            <div className={commonClasses} style={computedStyle}>
                {items.map((item) => (
                    linkToDetail ? (
                        <Link key={item.id} href={getDetailLink(item.slug)} className="block">
                            {renderItemContent(item)}
                        </Link>
                    ) : (
                        <div key={item.id}>
                            {renderItemContent(item)}
                        </div>
                    )
                ))}
            </div>
        )
    },

    childrenAllowed: false
})

export default CollectionList
