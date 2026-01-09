"use client"

import React, { forwardRef, useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import { useParams } from "next/navigation"
import axios from "axios"
import { useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import { CollectionItemProvider } from "./CollectionItemContext"

export interface CollectionContainerProps {
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
    children?: React.ReactNode

    // Style props for mapping
    width?: string | number
    height?: string | number
    minHeight?: string | number
    backgroundColor?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string

    marginTop?: number
    marginBottom?: number
    marginLeft?: number
    marginRight?: number
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number

    style?: BlockStyle
    className?: string
}

export const CollectionContainer = defineBlock<CollectionContainerProps>({
    name: "Collection Container",
    category: "Collections",
    icon: <div className="p-1">📦</div>, // Placeholder or use icon from registry if accessible

    defaultProps: {
        collectionId: "",
        itemId: "",
        useSlugFromUrl: false,
        className: "p-4",

        // Defaults for legacy props
        width: "100%",
        backgroundColor: "transparent",
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 0,

        style: {},
    },

    settingsConfig: {
        // Data settings
        collectionId: {
            label: "Collection",
            type: "collection-select",
            section: "Data Match",
        },
        itemId: {
            label: "Item ID",
            type: "text",
            section: "Data Match",
            description: "Optional: Specific item ID"
        },
        useSlugFromUrl: {
            label: "Use URL Slug",
            type: "checkbox",
            section: "Data Match",
            description: "Match item based on page URL slug"
        },

        // Size
        width: { label: "Width", type: "text", section: "Size", placeholder: "100%, 500px" },
        height: { label: "Height", type: "text", section: "Size", placeholder: "auto, 400px" },
        minHeight: { label: "Min Height", type: "text", section: "Size" },

        // Appearance
        backgroundColor: { label: "Background", type: "color", section: "Styles" },
        borderRadius: { label: "Radius", type: "slider", section: "Styles", min: 0, max: 50 },
        borderWidth: { label: "Border Width", type: "slider", section: "Styles", min: 0, max: 20 },
        borderColor: { label: "Border Color", type: "color", section: "Styles" },

        // Spacing
        marginTop: { label: "Margin Top", type: "number", section: "Spacing" },
        marginBottom: { label: "Margin Bottom", type: "number", section: "Spacing" },
        marginLeft: { label: "Margin Left", type: "number", section: "Spacing" },
        marginRight: { label: "Margin Right", type: "number", section: "Spacing" },
        paddingTop: { label: "Padding Top", type: "number", section: "Spacing" },
        paddingBottom: { label: "Padding Bottom", type: "number", section: "Spacing" },
        paddingLeft: { label: "Padding Left", type: "number", section: "Spacing" },
        paddingRight: { label: "Padding Right", type: "number", section: "Spacing" },
    },

    render: ({
        collectionId = "",
        itemId = "",
        useSlugFromUrl = false,
        className = "",
        children,
        style,

        // Destructure mapped props
        width, height, minHeight,
        backgroundColor, borderRadius, borderWidth, borderColor,
        marginTop, marginBottom, marginLeft, marginRight,
        paddingTop, paddingBottom, paddingLeft, paddingRight
    }) => {
        const [itemData, setItemData] = useState<any>(null)
        const [fields, setFields] = useState<any[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
        const params = useParams()
        const slugFromUrl = params?.slug as string

        const { connectors: { connect, drag } } = useNode()

        // Merge props into style
        const mergedStyle: BlockStyle = {
            ...style,
            width, height, minHeight,
            backgroundColor, borderRadius, borderWidth, borderColor,
            marginTop, marginBottom, marginLeft, marginRight,
            paddingTop, paddingBottom, paddingLeft, paddingRight
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: mergedStyle,
            className: cn("min-h-[50px] relative transition-all", className)
        })

        // Fetch data logic
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

                    // 1. Fetch collection metadata
                    const { data: collectionData } = await axios.get(
                        `/api/v1/${team.id}/collections/${collectionId}/items?limit=1`,
                        { signal: controller.signal }
                    )
                    setFields(collectionData.collection?.fields || [])

                    // 2. Fetch Item Data
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
                        if (foundItem) setItemData(foundItem)
                        else setError("Item not found")

                    } else if (targetSlug) {
                        const { data } = await axios.get(
                            `/api/v1/${team.id}/collections/${collectionId}/items?limit=100`,
                            { signal: controller.signal }
                        )
                        const foundItem = data.items?.find((i: any) => i.slug === targetSlug)
                        if (foundItem) setItemData(foundItem)
                        else setError("Item not found")
                    } else {
                        // Fallback: use first item
                        if (collectionData.items?.length > 0) {
                            setItemData(collectionData.items[0])
                        }
                    }

                } catch (err: any) {
                    if (axios.isCancel(err)) return
                    console.error("Failed to load data for container:", err)
                    setError("Failed to load data")
                } finally {
                    setLoading(false)
                }
            }

            loadItem()
            return () => controller.abort()
        }, [team?.id, collectionId, itemId, useSlugFromUrl, slugFromUrl])

        const contextValue = {
            data: itemData?.data || {},
            slug: itemData?.slug || '',
            id: itemData?.id || '',
            fields,
            loading: loading || teamLoading,
        }

        if (!collectionId) {
            return (
                <div
                    className={cn("p-4 border-2 border-dashed border-muted-foreground/20 rounded min-h-[100px] flex items-center justify-center bg-muted/5", computedClassName)}
                    style={computedStyle}
                >
                    <span className="text-muted-foreground text-sm">Select a Collection</span>
                </div>
            )
        }

        return (
            <CollectionItemProvider value={contextValue}>
                <div
                    className={computedClassName}
                    style={computedStyle}
                >
                    {children ? children : (
                        <div className="p-8 border border-dashed border-border text-center text-muted-foreground text-sm">
                            Container Ready. Drop fields here.
                        </div>
                    )}
                </div>
            </CollectionItemProvider>
        )
    }
})
