"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEditor } from "@craftjs/core"
import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { cn } from "@/lib/utils"

// Image component - simple wrapper for external images
const ArticleImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
)

interface Article {
    id: string
    title: string
    excerpt: string
    slug: string
    author: {
        name: string | null
    }
    categories: { id: string; name: string }[]
    cover: string | null
    createdAt: Date
    metadata?: {
        readingTime?: number
        [key: string]: any
    }
}

export interface ArticlesProps {
    title?: string
    thumbnail?: boolean
    limit?: number
    style?: "boxed" | "simple" | "minimal" | "magazine"
    minimalImageAlignment?: "left" | "right"
    category?: string // Legacy or fallback
    selectedCategories?: { name: string }[] // Array of category objects from settings

    // Block styles
    blockStyle?: BlockStyle
    className?: string
}

export const Articles = defineBlock<ArticlesProps>({
    name: "Articles",
    category: "Content",
    icon: <div className="p-1">📰</div>,

    defaultProps: {
        title: "Latest Articles",
        thumbnail: true,
        limit: 10,
        style: "magazine",
        minimalImageAlignment: "left",
        category: "ARTICLES",
        selectedCategories: [],
        blockStyle: {},
    },

    settingsConfig: {
        // Display Section
        title: { label: "Title", type: "text", section: "Display" },
        style: {
            label: "Style",
            type: "select",
            section: "Display",
            options: [
                { label: "Magazine", value: "magazine" },
                { label: "Boxed", value: "boxed" },
                { label: "Simple", value: "simple" },
                { label: "Minimal", value: "minimal" },
            ],
        },
        minimalImageAlignment: {
            label: "Image Alignment (Minimal Only)",
            type: "select",
            section: "Display",
            options: [
                { label: "Left", value: "left" },
                { label: "Right", value: "right" },
            ],
        },
        thumbnail: { label: "Show Thumbnails", type: "checkbox", section: "Display" },

        // Data Section
        limit: { label: "Articles Limit", type: "slider", min: 1, max: 50, section: "Data" },
        category: { label: "Default Category Label", type: "text", section: "Data" },
        selectedCategories: {
            label: "Filter Categories",
            type: "array",
            section: "Data",
            arrayFields: {
                name: { type: "text", label: "Category" }
            }
        },
    },

    render: ({
        title = "Latest Articles",
        thumbnail = true,
        limit = 10,
        style = "magazine",
        minimalImageAlignment = "left",
        category = "ARTICLES",
        selectedCategories = [],
        className = "",
        blockStyle,
    }) => {
        const [articles, setArticles] = useState<Article[]>([])
        const [loading, setLoading] = useState(true)
        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...blockStyle,
                // Assign CSS variables for children to inherit
                "--design-font-heading": "var(--design-font-heading, inherit)",
                "--design-font-base": "var(--design-font-base, inherit)",
            } as any,
            className
        })

        // Check if we're in the editor
        const { isEditor } = useEditor((state) => ({ isEditor: state.options.enabled }))

        // Wrapper component to handle editor mode interaction
        const ArticleWrapper = ({
            href,
            className,
            children
        }: {
            href: string
            className?: string
            children: React.ReactNode
        }) => {
            if (isEditor) {
                return (
                    <div className={className}>
                        {children}
                    </div>
                )
            }
            return (
                <Link href={href} className={className}>
                    {children}
                </Link>
            )
        }

        useEffect(() => {
            if (!team?.id) return
            const controller = new AbortController()
            const loadArticles = async () => {
                try {
                    setLoading(true)

                    // Build query params
                    const params = new URLSearchParams()
                    params.set("limit", limit.toString())

                    if (selectedCategories && selectedCategories.length > 0) {
                        const categoryNames = selectedCategories.map(c => c.name).filter(Boolean).join(",")
                        if (categoryNames) {
                            params.set("categories", categoryNames)
                        }
                    }

                    const { data } = await axios.get(
                        `/api/v1/${team.id}/articles?${params.toString()}`,
                        { signal: controller.signal }
                    )
                    setArticles(data || [])
                } catch (error: any) {
                    if (axios.isCancel(error)) return
                    console.error("Failed to load articles:", error)
                } finally {
                    setLoading(false)
                }
            }

            loadArticles()
            return () => controller.abort()
        }, [team?.id, limit, selectedCategories])

        // Design tokens - explicitly set directly on elements (CSS variable inheritance can be tricky in some contexts)
        const headingFont = {
            fontFamily: "var(--design-font-heading, inherit)",
            color: "var(--design-text-heading, inherit) !important"
        } as React.CSSProperties

        const bodyFont = {
            fontFamily: "var(--design-font-base, inherit)",
            color: "var(--design-text-body, inherit) !important"
        } as React.CSSProperties

        // Loading skeletons
        if (loading || teamLoading) {
            // Magazine style skeleton
            if (style === "magazine") {
                return (
                    <div className={cn("space-y-0", computedClassName)} style={computedStyle}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border-b border-border py-8 flex items-center gap-6">
                                <div className="hidden md:flex items-center justify-center min-w-[80px]">
                                    <div className="w-3 h-20 bg-muted animate-pulse rounded" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 bg-muted animate-pulse rounded w-24" />
                                        <div className="h-4 bg-muted animate-pulse rounded w-16" />
                                    </div>
                                </div>
                                {thumbnail && (
                                    <div className="w-32 h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 bg-muted animate-pulse rounded" />
                                )}
                            </div>
                        ))}
                    </div>
                )
            }

            // Boxed style skeleton
            if (style === "boxed") {
                return (
                    <Card className={computedClassName} style={computedStyle}>
                        <CardHeader>
                            <div className="h-6 bg-muted animate-pulse rounded w-48 mb-2" />
                            <div className="h-4 bg-muted animate-pulse rounded w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
                                    <div key={i} className="border-b pb-4 last:border-0 flex gap-3">
                                        {thumbnail && (
                                            <div className="w-32 h-24 bg-muted animate-pulse rounded-md" />
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                                            <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                            <div className="h-3 bg-muted animate-pulse rounded w-24" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            // Simple style skeleton
            if (style === "simple") {
                return (
                    <div className={cn("space-y-4", computedClassName)} style={computedStyle}>
                        {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
                            <div key={i} className="border-b pb-4 last:border-0 flex gap-3">
                                {thumbnail && (
                                    <div className="w-32 h-24 bg-muted animate-pulse rounded-md" />
                                )}
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            // Minimal style skeleton
            return (
                <div className={cn("space-y-4", computedClassName)} style={computedStyle}>
                    {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
                        <div key={i} className={`border-b pb-4 last:border-0 flex flex-col gap-3 ${minimalImageAlignment === 'right' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                            {thumbnail && (
                                <div className="w-80 h-64 bg-muted animate-pulse" />
                            )}
                            <div className="flex-1 space-y-2">
                                <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                <div className="h-3 bg-muted animate-pulse rounded w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        // Empty state
        if (!articles.length) {
            return (
                <Card className={computedClassName} style={computedStyle}>
                    <CardHeader>
                        <CardTitle style={headingFont}>{title}</CardTitle>
                        <CardDescription style={bodyFont}>No articles found</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground py-8 text-center" style={bodyFont}>
                        Nothing to read here yet.
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className={computedClassName} style={computedStyle}>
                {/* Boxed Style */}
                {style === "boxed" && (
                    <Card>
                        <CardHeader>
                            <CardTitle style={headingFont}>{title}</CardTitle>
                            <CardDescription style={bodyFont}>
                                Showing {articles.length} article{articles.length > 1 ? "s" : ""}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {articles.map((article) => (
                                    <ArticleWrapper
                                        href={`/article/${article.slug}`}
                                        key={article.id}
                                        className="border-b pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row gap-3 cursor-pointer"
                                    >
                                        {thumbnail && article.cover && (
                                            <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden bg-muted">
                                                <ArticleImage
                                                    src={article.cover}
                                                    alt={article.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1" style={headingFont}>{article.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2" style={bodyFont}>
                                                {article.excerpt}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground" style={bodyFont}>
                                                <span>{article.author?.name || "Anonymous"}</span>
                                                <span>•</span>
                                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                                {article.metadata?.readingTime && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{article.metadata.readingTime} min read</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </ArticleWrapper>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Simple Style */}
                {style === "simple" && (
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <ArticleWrapper
                                href={`/article/${article.slug}`}
                                key={article.id}
                                className="border-b pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row gap-3 cursor-pointer"
                            >
                                {thumbnail && article.cover && (
                                    <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden bg-muted">
                                        <ArticleImage
                                            src={article.cover}
                                            alt={article.title}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1" style={headingFont}>{article.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2" style={bodyFont}>
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground" style={bodyFont}>
                                        <span>{article.author?.name || "Anonymous"}</span>
                                        <span>•</span>
                                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                        {article.metadata?.readingTime && (
                                            <>
                                                <span>•</span>
                                                <span>{article.metadata.readingTime} min read</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </ArticleWrapper>
                        ))}
                    </div>
                )}

                {/* Minimal Style */}
                {style === "minimal" && (
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <ArticleWrapper
                                href={`/article/${article.slug}`}
                                key={article.id}
                                className={`border-b pb-4 last:border-0 flex flex-col gap-3 ${minimalImageAlignment === 'right' ? 'sm:flex-row-reverse' : 'sm:flex-row'} cursor-pointer`}
                            >
                                {thumbnail && article.cover && (
                                    <div className="w-full sm:w-80 h-64 overflow-hidden bg-muted">
                                        <ArticleImage
                                            src={article.cover}
                                            alt={article.title}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-2xl max-w-xl mb-1" style={headingFont}>{article.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-2 max-w-xl line-clamp-2" style={bodyFont}>
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground" style={bodyFont}>
                                        <span>{article.author?.name || "Anonymous"}</span>
                                        <span>•</span>
                                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                        {article.metadata?.readingTime && (
                                            <>
                                                <span>•</span>
                                                <span>{article.metadata.readingTime} min read</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </ArticleWrapper>
                        ))}
                    </div>
                )}

                {/* Magazine Style */}
                {style === "magazine" && (
                    <div className="space-y-0">
                        {articles.map((article) => (
                            <ArticleWrapper
                                href={`/article/${article.slug}`}
                                key={article.id}
                                className="group border-b border-border py-8 flex items-center gap-6 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                {/* Vertical Category Label */}
                                <div className="hidden md:flex items-center justify-center min-w-[80px]">
                                    <span
                                        className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
                                        style={{
                                            writingMode: 'vertical-rl',
                                            textOrientation: 'mixed',
                                            ...bodyFont
                                        }}
                                    >
                                        {article.categories?.[0]?.name || category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 group-hover:text-primary transition-colors" style={headingFont}>
                                        {article.title}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm" style={bodyFont}>
                                        <span className="text-emerald-500 font-semibold uppercase tracking-wide">
                                            {article.author?.name || "Anonymous"}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {new Date(article.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        {article.metadata?.readingTime && (
                                            <span className="text-muted-foreground">
                                                • {article.metadata.readingTime} min read
                                            </span>
                                        )}
                                    </div>
                                </div>


                                {/* Thumbnail */}
                                {thumbnail && article.cover && (
                                    <div className="w-32 h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 flex-shrink-0 overflow-hidden bg-muted">
                                        <ArticleImage
                                            src={article.cover}
                                            alt={article.title}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                            </ArticleWrapper>
                        ))}
                    </div>
                )}
            </div>
        )
    }
})

export default Articles
