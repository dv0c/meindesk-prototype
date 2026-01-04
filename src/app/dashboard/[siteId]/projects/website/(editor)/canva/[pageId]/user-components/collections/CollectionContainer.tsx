"use client"

import React, { forwardRef, useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import { useParams } from "next/navigation"
import axios from "axios"
import { useNode } from "@craftjs/core"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../lib/withCraftComponent"
import { cn } from "@/lib/utils"
import { CollectionItemProvider } from "./CollectionItemContext"

interface CollectionContainerProps extends CraftComponentProps {
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
    children?: React.ReactNode
}

const CollectionContainerBase = forwardRef<HTMLDivElement, CollectionContainerProps>(
    (
        {
            collectionId = "",
            itemId = "",
            useSlugFromUrl = false,
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        const [itemData, setItemData] = useState<any>(null)
        const [fields, setFields] = useState<any[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
        const params = useParams()
        const slugFromUrl = params?.slug as string

        const { connectors: { connect, drag } } = useNode()

        // Fetch data logic (similar to CollectionItem but simplified)
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

                    // 1. Fetch collection fields/meta
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
                        // Fetch by ID
                        const { data } = await axios.get(
                            `/api/v1/${team.id}/collections/${collectionId}/items?limit=100`,
                            { signal: controller.signal }
                        )
                        // Note: ideally we should have a get-by-id endpoint, but for now we reuse the list one
                        const foundItem = data.items?.find((i: any) => i.id === itemId)
                        if (foundItem) setItemData(foundItem)
                        else setError("Item not found")

                    } else if (targetSlug) {
                        // Fetch by Slug
                        const { data } = await axios.get(
                            `/api/v1/${team.id}/collections/${collectionId}/items?limit=100`,
                            { signal: controller.signal }
                        )
                        const foundItem = data.items?.find((i: any) => i.slug === targetSlug)
                        if (foundItem) setItemData(foundItem)
                        else setError("Item not found")
                    } else {
                        // Fallback: use first item (for demo/preview)
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

        // Render states
        if (!collectionId) {
            return (
                <div ref={ref} className={cn("p-4 border-2 border-dashed border-muted-foreground/20 rounded min-h-[100px] flex items-center justify-center bg-muted/5", className)}>
                    <span className="text-muted-foreground text-sm">Select a Collection</span>
                </div>
            )
        }

        return (
            <CollectionItemProvider value={contextValue}>
                <div
                    ref={ref}
                    className={cn("min-h-[50px] relative", className)}
                    {...props}
                >
                    {/* 
                       If data is loading, we can show a spinner or just render children with potential empty data. 
                       Better to render children so the editor doesn't flash empty.
                     */}
                    {children ? children : (
                        <div className="p-8 border border-dashed border-border text-center text-muted-foreground text-sm">
                            Container Ready. Drop fields here.
                        </div>
                    )}
                </div>
            </CollectionItemProvider>
        )
    }
)

CollectionContainerBase.displayName = "CollectionContainerBase"

export const CollectionContainer = withCraftComponent<CollectionContainerProps, HTMLDivElement>(
    CollectionContainerBase,
    {
        displayName: "Collection Container",
        sectionTitle: "Container Data",
        defaultProps: {
            collectionId: "",
            itemId: "",
            useSlugFromUrl: false,
            className: "w-full p-4"
        },
        settingsConfig: {
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
            // Add style props here if we want standard spacing/colors via settings
            // But withCraftComponent auto-generates some if we don't specify? 
            // Actually generatedSettings uses the config passed here. 
            // We can add standard visual props:
            backgroundColor: { label: "Background", type: "color", section: "Styles" },
            paddingTop: { label: "Padding Top", type: "number", section: "Spacing" },
            paddingBottom: { label: "Padding Bottom", type: "number", section: "Spacing" },
            paddingLeft: { label: "Padding Left", type: "number", section: "Spacing" },
            paddingRight: { label: "Padding Right", type: "number", section: "Spacing" },
        }
    }
)

export default CollectionContainer
