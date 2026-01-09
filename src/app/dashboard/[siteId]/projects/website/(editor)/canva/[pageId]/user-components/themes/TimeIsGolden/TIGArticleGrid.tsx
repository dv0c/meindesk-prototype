"use client"

import React, { forwardRef, useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import { useNode } from "@craftjs/core"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../../lib/withCraftComponent"
import { cn } from "@/lib/utils"
import { PropertySection, PropertyRow, PropertyInput } from "../../../components/PropertySection"

// Types duplicated from CollectionList for independence
interface CollectionItem {
    id: string
    slug: string
    status: string
    data: Record<string, any>
    createdAt: string
    updatedAt: string
}

interface TIGArticleGridProps extends CraftComponentProps {
    collectionId?: string
    limit?: number
    showImage?: boolean
}

const TIGArticleGridBase = forwardRef<HTMLDivElement, TIGArticleGridProps>(
    (
        {
            collectionId = "Articles", // Default to "Articles" for TIG
            limit = 9,
            showImage = true,
            className = "",
        },
        ref
    ) => {
        const [items, setItems] = useState<CollectionItem[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
        const { connectors: { connect, drag } } = useNode()

        useEffect(() => {
            if (!team?.id || !collectionId) {
                // If it's the "Articles" virtual collection, we might handle it differently, 
                // but for now relying on existing API which handles collectionId string.
                if (collectionId === "Articles" && team?.id) {
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
                    // If "Articles", we might need a specific endpoint or just rely on 'Articles' being a valid collection ID/Slug in the backend?
                    // The standard getItems action supports real collections.
                    // For "Articles" system collection, we generally use getArticles.
                    // But here we are fetching from API /api/v1/.../collections/...
                    // If collectionId is a UUID, it works. If it's "Articles", the API needs to support it.
                    // Assuming user selects a real collection ID via settings or "Articles" works.
                    // For safety, I'll assume usage of real collection IDs.

                    const { data } = await axios.get(
                        `/api/v1/${team.id}/collections/${collectionId}/items?limit=${limit}`,
                        { signal: controller.signal }
                    )
                    setItems(data.items || [])
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
                    href={`/article/${item.slug}`} // Assuming standard article path for TIG for now
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
                            {/* Category Tag (Fake for now or derived) */}
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
                <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
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

        if (error) return <div ref={ref}>Error loading articles.</div>
        if (!items.length) return <div ref={ref} className="p-8 border border-dashed text-center text-muted-foreground">Select a collection to display articles.</div>

        return (
            <div
                ref={ref}
                className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12", className)}
            >
                {items.map((item, i) => renderItem(item, i))}
            </div>
        )
    }
)

TIGArticleGridBase.displayName = "TIGArticleGridBase"

const defaultProps = {
    collectionId: "",
    limit: 7,
    showImage: true
}

export const TIGArticleGrid = withCraftComponent<TIGArticleGridProps, HTMLDivElement>(
    TIGArticleGridBase,
    {
        displayName: "TIG Grid",
        defaultProps,
        settingsConfig: {
            collectionId: {
                label: "Collection",
                type: "collection-select",
                section: "Data",
            },
            limit: {
                label: "Count",
                type: "slider",
                min: 1,
                max: 20,
                section: "Data",
            },
            showImage: {
                label: "Show Image",
                type: "checkbox",
                section: "Display",
            }
        }
    }
)
