"use client"

import React, { useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import { useParams } from "next/navigation"
import axios from "axios"
import { useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import { CollectionItemProvider } from "./CollectionItemContext"
import {
    PropertySection,
    PropertyRow,
    PropertySelect,
    PropertyInput,
    PropertyCheckbox,
} from "../../components/PropertySection"
import { Database } from "lucide-react"

// Types
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

interface CollectionItemProps {
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
    layout?: "card" | "hero" | "detail" | "minimal" | "custom"
    showImage?: boolean
    imageField?: string
    titleField?: string
    showAllFields?: boolean
    fieldsToShow?: string[]
    style?: BlockStyle
    className?: string
    children?: React.ReactNode
}

const defaultStyles: BlockStyle = {
    width: "100%",
}

const CollectionItemSettings = () => {
    const {
        actions: { setProp },
        collectionId,
        itemId,
        useSlugFromUrl,
        layout,
        showImage,
        imageField,
        titleField,
        showAllFields
    } = useNode((node) => ({
        collectionId: node.data.props.collectionId,
        itemId: node.data.props.itemId,
        useSlugFromUrl: node.data.props.useSlugFromUrl,
        layout: node.data.props.layout,
        showImage: node.data.props.showImage,
        imageField: node.data.props.imageField,
        titleField: node.data.props.titleField,
        showAllFields: node.data.props.showAllFields,
    }))

    return (
        <div>
            <PropertySection title="Data Source">
                <PropertyRow label="Collection">
                    {/* Placeholder for actual collection select - using simple input or assuming custom component exists */}
                    <PropertyInput
                        value={collectionId || ""}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.collectionId = v))}
                        placeholder="Collection ID"
                    />
                </PropertyRow>
                <PropertyRow label="Item ID">
                    <PropertyInput
                        value={itemId || ""}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.itemId = v))}
                        placeholder="Optional ID"
                    />
                </PropertyRow>
                <PropertyRow label="Use URL Slug">
                    <PropertyCheckbox
                        checked={useSlugFromUrl || false}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.useSlugFromUrl = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Layout">
                <PropertyRow label="Style">
                    <PropertySelect
                        value={layout || "card"}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.layout = v as any))}
                        options={[
                            { label: "Card", value: "card" },
                            { label: "Hero", value: "hero" },
                            { label: "Detail", value: "detail" },
                            { label: "Minimal", value: "minimal" },
                            { label: "Custom", value: "custom" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Display">
                <PropertyRow label="Show Image">
                    <PropertyCheckbox
                        checked={showImage !== false}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.showImage = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Image Field">
                    <PropertyInput
                        value={imageField || ""}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.imageField = v))}
                        placeholder="Auto-detect"
                    />
                </PropertyRow>
                <PropertyRow label="Title Field">
                    <PropertyInput
                        value={titleField || ""}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.titleField = v))}
                        placeholder="Auto-detect"
                    />
                </PropertyRow>
                <PropertyRow label="Show All Fields">
                    <PropertyCheckbox
                        checked={showAllFields !== false}
                        onChange={(v) => setProp((props: CollectionItemProps) => (props.showAllFields = v))}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const CollectionItem = defineBlock<CollectionItemProps>({
    name: "CollectionItem",
    category: "Data",
    icon: <Database className="w-4 h-4" />,
    description: "Display a single item from a collection",

    defaultProps: {
        collectionId: "",
        itemId: "",
        useSlugFromUrl: false,
        layout: "card",
        showImage: true,
        imageField: "",
        titleField: "",
        showAllFields: true,
        style: defaultStyles
    },

    settings: CollectionItemSettings,

    render: ({
        collectionId,
        itemId,
        useSlugFromUrl,
        layout = "card",
        showImage = true,
        imageField,
        titleField,
        showAllFields = true,
        fieldsToShow = [],
        style,
        className,
        children,
        theme,
    }) => {
        const [item, setItem] = useState<CollectionItemData | null>(null)
        const [fields, setFields] = useState<CollectionFieldDef[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
        const params = useParams()
        const slugFromUrl = params?.slug as string

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

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

                    // Fetch Collection definition
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

        // Context Value
        const contextValue = {
            data: item?.data || {},
            slug: item?.slug || '',
            id: item?.id || '',
            fields,
            loading: loading || teamLoading,
        }

        const commonClasses = cn(computedClassName, "w-full")

        if (loading || teamLoading) {
            return (
                <div className={cn("border border-border bg-card p-6 space-y-4", commonClasses)} style={computedStyle}>
                    {showImage && <div className="aspect-video bg-muted animate-pulse" />}
                    <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                    <div className="space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </div>
                </div>
            )
        }

        if (!collectionId) {
            return (
                <div className={cn("border-2 border-dashed border-border p-8 text-center", commonClasses)} style={computedStyle}>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                        Select a collection in settings
                    </p>
                </div>
            )
        }

        if (error) {
            return (
                <div className={cn("border border-destructive/50 bg-destructive/5 p-8 text-center", commonClasses)} style={computedStyle}>
                    <p className="text-destructive font-mono text-sm">{error}</p>
                </div>
            )
        }

        if (!item) {
            return (
                <div className={cn("border border-border p-8 text-center", commonClasses)} style={computedStyle}>
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

        // Custom Layout
        if (layout === "custom") {
            return (
                <CollectionItemProvider value={contextValue}>
                    <div className={cn("collection-item-custom", commonClasses)} style={computedStyle}>
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
                    <div className={cn("relative", commonClasses)} style={computedStyle}>
                        {showImage && imageUrl && (
                            <div className="aspect-[21/9] relative overflow-hidden bg-muted">
                                <img src={imageUrl} alt={String(title)} className="w-full h-full object-cover" />
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
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">{field.label}</h3>
                                        <div className="text-foreground">{renderFieldValue(item.data?.[field.name], field.type)}</div>
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
                    <div className={cn("space-y-6", commonClasses)} style={computedStyle}>
                        <h1 className="text-3xl font-bold">{title}</h1>
                        {showImage && imageUrl && (
                            <div className="aspect-video overflow-hidden bg-muted rounded-lg">
                                <img src={imageUrl} alt={String(title)} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="grid gap-6">
                            {visibleFields.map(field => (
                                <div key={field.name} className="border-b border-border pb-4 last:border-0">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{field.label}</h3>
                                    <div className="text-foreground">{renderFieldValue(item.data?.[field.name], field.type)}</div>
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
                    <div className={cn("space-y-4", commonClasses)} style={computedStyle}>
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
                <div className={cn("border border-border bg-card overflow-hidden block", commonClasses)} style={computedStyle}>
                    {showImage && imageUrl && (
                        <div className="aspect-video overflow-hidden bg-muted">
                            <img src={imageUrl} alt={String(title)} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-6 space-y-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        {visibleFields.slice(0, 3).map(field => (
                            <div key={field.name}>
                                <span className="text-xs font-medium text-muted-foreground uppercase">{field.label}:</span>
                                <p className="text-foreground mt-1">{renderFieldValue(item.data?.[field.name], field.type)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CollectionItemProvider>
        )
    },

    childrenAllowed: true
})

export default CollectionItem
