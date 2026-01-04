"use client"

import React, { forwardRef, useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import { useParams } from "next/navigation"
import axios from "axios"
import { useNode, Element } from "@craftjs/core"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../lib/withCraftComponent"
import { cn } from "@/lib/utils"
import { CollectionItemProvider } from "./CollectionItemContext"
import { Container } from "../Container"

interface CollectionFieldDef {
    name: string
    type: string
    label: string
    required?: boolean
}

interface CollectionItemData {
    id: string
    slug: string
    status: string
    data: Record<string, any>
    createdAt: string
    updatedAt: string
}

interface CollectionItemProps extends CraftComponentProps {
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
    layout?: "card" | "hero" | "detail" | "minimal" | "custom"
    showImage?: boolean
    imageField?: string
    titleField?: string
    showAllFields?: boolean
    fieldsToShow?: string[]
    children?: React.ReactNode
}

const CollectionItemBase = forwardRef<HTMLDivElement, CollectionItemProps>(
    (
        {
            collectionId = "",
            itemId = "",
            useSlugFromUrl = false,
            layout = "card",
            showImage = true,
            imageField = "",
            titleField = "",
            showAllFields = true,
            fieldsToShow = [],
            className = "",
            children,
        },
        ref
    ) => {
        const [item, setItem] = useState<CollectionItemData | null>(null)
        const [fields, setFields] = useState<CollectionFieldDef[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
        const params = useParams()

        const slugFromUrl = params?.slug as string

        useEffect(() => {
            if (!team?.id || !collectionId) {
                setLoading(false)
                return
            }

            const controller = new AbortController()
            const loadItem = async () => {
                try {
                    setLoading(true)
                    setError(null)

                    const { data: collectionData } = await axios.get(
                        `/api/v1/${team.id}/collections/${collectionId}/items?limit=1`,
                        { signal: controller.signal }
                    )
                    setFields(collectionData.collection?.fields || [])

                    let targetSlug = ''
                    if (useSlugFromUrl && slugFromUrl) {
                        targetSlug = slugFromUrl
                    }

                    if (itemId) {
                        const { data } = await axios.get(
                            `/api/v1/${team.id}/collections/${collectionId}/items?limit=100`,
                            { signal: controller.signal }
                        )
                        const foundItem = data.items?.find((i: any) => i.id === itemId)
                        if (foundItem) {
                            setItem(foundItem)
                        } else {
                            setError("Item not found")
                        }
                    } else if (targetSlug) {
                        const { data } = await axios.get(
                            `/api/v1/${team.id}/collections/${collectionId}/items?limit=100`,
                            { signal: controller.signal }
                        )
                        const foundItem = data.items?.find((i: any) => i.slug === targetSlug)
                        if (foundItem) {
                            setItem(foundItem)
                        } else {
                            setError("Item not found")
                        }
                    } else {
                        if (collectionData.items?.length > 0) {
                            setItem(collectionData.items[0])
                        }
                    }
                } catch (err: any) {
                    if (axios.isCancel(err)) return
                    console.error("Failed to load collection item:", err)
                    setError("Failed to load item")
                } finally {
                    setLoading(false)
                }
            }

            loadItem()
            return () => controller.abort()
        }, [team?.id, collectionId, itemId, useSlugFromUrl, slugFromUrl])

        // Field helpers
        const getImageField = () => {
            if (imageField) return imageField
            const imgField = fields?.find(f => f.type === 'image')
            return imgField?.name || ''
        }

        const getTitleField = () => {
            if (titleField) return titleField
            const textFields = fields?.filter(f => f.type === 'text') || []
            const titleCandidate = textFields.find(f =>
                f.name.toLowerCase().includes('title') ||
                f.name.toLowerCase().includes('name')
            )
            return titleCandidate?.name || textFields[0]?.name || ''
        }

        const getVisibleFields = () => {
            if (!showAllFields && Array.isArray(fieldsToShow) && fieldsToShow.length > 0) {
                return fields.filter(f => fieldsToShow.includes(f.name))
            }
            const imgField = getImageField()
            const ttlField = getTitleField()
            return fields.filter(f => f.name !== imgField && f.name !== ttlField)
        }

        const renderFieldValue = (value: any, fieldType?: string) => {
            if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>

            if (fieldType === 'boolean') {
                return value ? <span className="text-green-500">Yes</span> : <span className="text-muted-foreground">No</span>
            }

            if (fieldType === 'date' && value) {
                return new Date(value).toLocaleDateString()
            }

            if (fieldType === 'richtext' && value) {
                return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
            }

            if (fieldType === 'image' && value) {
                return <img src={value} alt="" className="max-w-full h-auto rounded" />
            }

            if (Array.isArray(value)) {
                return value.join(', ')
            }

            if (typeof value === 'object') {
                return value.title || value.name || value.slug || JSON.stringify(value)
            }

            return String(value)
        }

        // Prepare context value
        const contextValue = {
            data: item?.data || {},
            slug: item?.slug || '',
            id: item?.id || '',
            fields,
            loading: loading || teamLoading,
        }

        // Loading skeleton
        if (loading || teamLoading) {
            return (
                <div ref={ref} className={cn("border border-border bg-card p-6 space-y-4", className)}>
                    {showImage && <div className="aspect-video bg-muted animate-pulse" />}
                    <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                    <div className="space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </div>
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

        // No item state
        if (!item) {
            return (
                <div ref={ref} className={cn("border border-border p-8 text-center", className)}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        {useSlugFromUrl ? "Item will load from URL slug" : "No item selected"}
                    </p>
                </div>
            )
        }

        const imgField = getImageField()
        const ttlField = getTitleField()
        const imageUrl = imgField ? item.data?.[imgField] : null
        const title = ttlField ? item.data?.[ttlField] : item.slug
        const visibleFields = getVisibleFields()

        // Custom Layout - allows child components with data binding
        if (layout === "custom") {
            return (
                <CollectionItemProvider value={contextValue}>
                    <div ref={ref} className={cn("collection-item-custom", className)}>
                        {children || (
                            <div className="border-2 border-dashed border-border p-8 text-center">
                                <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                                    Drop CollectionField components here
                                </p>
                            </div>
                        )}
                    </div>
                </CollectionItemProvider>
            )
        }

        // Hero Layout
        if (layout === "hero") {
            return (
                <CollectionItemProvider value={contextValue}>
                    <div ref={ref} className={cn("relative", className)}>
                        {showImage && imageUrl && (
                            <div className="aspect-[21/9] relative overflow-hidden bg-muted">
                                <img
                                    src={imageUrl}
                                    alt={String(title)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
                                </div>
                            </div>
                        )}
                        {(!showImage || !imageUrl) && (
                            <div className="py-16 px-8 bg-muted">
                                <h1 className="text-4xl font-bold">{title}</h1>
                            </div>
                        )}
                        {visibleFields.length > 0 && (
                            <div className="p-8 space-y-4">
                                {visibleFields.map(field => (
                                    <div key={field.name}>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            {field.label}
                                        </h3>
                                        <div className="text-foreground">
                                            {renderFieldValue(item.data?.[field.name], field.type)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CollectionItemProvider>
            )
        }

        // Detail Layout
        if (layout === "detail") {
            return (
                <CollectionItemProvider value={contextValue}>
                    <div ref={ref} className={cn("space-y-6", className)}>
                        <h1 className="text-3xl font-bold">{title}</h1>
                        {showImage && imageUrl && (
                            <div className="aspect-video overflow-hidden bg-muted rounded-lg">
                                <img
                                    src={imageUrl}
                                    alt={String(title)}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="grid gap-6">
                            {visibleFields.map(field => (
                                <div key={field.name} className="border-b border-border pb-4 last:border-0">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                        {field.label}
                                    </h3>
                                    <div className="text-foreground">
                                        {renderFieldValue(item.data?.[field.name], field.type)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CollectionItemProvider>
            )
        }

        // Minimal Layout
        if (layout === "minimal") {
            return (
                <CollectionItemProvider value={contextValue}>
                    <div ref={ref} className={cn("space-y-4", className)}>
                        <h2 className="text-2xl font-semibold">{title}</h2>
                        {visibleFields.map(field => (
                            <p key={field.name} className="text-muted-foreground">
                                {renderFieldValue(item.data?.[field.name], field.type)}
                            </p>
                        ))}
                    </div>
                </CollectionItemProvider>
            )
        }

        // Card Layout (default)
        return (
            <CollectionItemProvider value={contextValue}>
                <div ref={ref} className={cn("border border-border bg-card overflow-hidden", className)}>
                    {showImage && imageUrl && (
                        <div className="aspect-video overflow-hidden bg-muted">
                            <img
                                src={imageUrl}
                                alt={String(title)}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-6 space-y-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        {visibleFields.slice(0, 3).map(field => (
                            <div key={field.name}>
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                    {field.label}:
                                </span>
                                <p className="text-foreground mt-1">
                                    {renderFieldValue(item.data?.[field.name], field.type)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </CollectionItemProvider>
        )
    }
)

CollectionItemBase.displayName = "CollectionItemBase"

const defaultProps: Partial<CollectionItemProps> = {
    collectionId: "",
    itemId: "",
    useSlugFromUrl: false,
    layout: "card",
    showImage: true,
    imageField: "",
    titleField: "",
    showAllFields: true,
}

export const CollectionItem = withCraftComponent<CollectionItemProps, HTMLDivElement>(
    CollectionItemBase,
    {
        displayName: "CollectionItem",
        defaultProps,
        sectionTitle: "Collection Item",
        settingsConfig: {
            collectionId: {
                label: "Collection",
                type: "collection-select",
                section: "Data",
            },
            itemId: {
                label: "Item ID (optional)",
                type: "text",
                section: "Data",
                description: "Leave empty to use first item or URL slug"
            },
            useSlugFromUrl: {
                label: "Use Slug from URL",
                type: "checkbox",
                section: "Data",
                description: "Load item based on [slug] parameter in URL"
            },
            layout: {
                label: "Layout Style",
                type: "select",
                section: "Layout",
                options: [
                    { label: "Card", value: "card" },
                    { label: "Hero", value: "hero" },
                    { label: "Detail", value: "detail" },
                    { label: "Minimal", value: "minimal" },
                    { label: "Custom (for CollectionField)", value: "custom" },
                ],
            },
            showImage: {
                label: "Show Image",
                type: "checkbox",
                section: "Display",
            },
            imageField: {
                label: "Image Field Name",
                type: "text",
                section: "Display",
                description: "Leave empty to auto-detect"
            },
            titleField: {
                label: "Title Field Name",
                type: "text",
                section: "Display",
                description: "Leave empty to auto-detect"
            },
            showAllFields: {
                label: "Show All Fields",
                type: "checkbox",
                section: "Display",
            },
        },
    }
)

export default CollectionItem
