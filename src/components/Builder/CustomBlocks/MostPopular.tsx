"use client"

import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Article {
    id: string
    title: string
    excerpt: string
    slug: string
    author: {
        name: string | null
    }
    categories: string[]
    cover: string | null
    createdAt: Date
}

interface MostPopularProps {
    title?: string
    limit?: number
    style?: "compact" | "gradient" | "numbered" | "classic"
    className?: string
    [key: string]: any
}

export default function MostPopular({
    title = "MOST POPULAR",
    limit = 5,
    style = "gradient",
    className = "",
    ...props
}: MostPopularProps) {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const { team, loading: teamLoading } = useTeam(undefined, 'tenant')

    useEffect(() => {
        if (!team?.id) return
        const controller = new AbortController()
        const loadArticles = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(
                    `/api/v1/${team.id}/articles?limit=${limit}`,
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
    }, [team?.id, limit])

    // Loading States
    if (loading || teamLoading) {
        // Gradient style skeleton
        if (style === "gradient") {
            return (
                <div
                    className={`relative rounded-3xl overflow-hidden flex ${className}`}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                    {...props}
                >
                    <div className="flex items-center justify-center px-6 py-12">
                        <h2
                            className="text-xs font-bold tracking-[0.3em] text-white/90 whitespace-nowrap"
                            style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed'
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                    <div className="flex-1 py-8 pr-8 space-y-0">
                        {Array.from({ length: limit }).map((_, i) => (
                            <div key={i} className="py-6 border-b border-white/20 last:border-0">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-7 bg-white/20 animate-pulse rounded w-3/4" />
                                        <div className="flex gap-3">
                                            <div className="h-4 bg-white/20 animate-pulse rounded w-32" />
                                            <div className="h-4 bg-white/20 animate-pulse rounded w-20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        // Numbered style skeleton
        if (style === "numbered") {
            return (
                <div className={`space-y-4 ${className}`} {...props}>
                    {Array.from({ length: limit }).map((_, i) => (
                        <div key={i} className="flex items-start gap-6 p-4 rounded-lg bg-muted/50">
                            <div className="text-4xl font-black text-muted animate-pulse w-12 h-12 bg-muted rounded" />
                            <div className="flex-1 space-y-2">
                                <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        // Classic style skeleton
        if (style === "classic") {
            return (
                <Card className={className} {...props}>
                    <CardHeader>
                        <div className="h-6 bg-muted animate-pulse rounded w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Array.from({ length: limit }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                                    <div className="w-6 h-6 bg-muted animate-pulse rounded" />
                                    <div className="flex-1 h-5 bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )
        }

        // Compact style skeleton (default)
        return (
            <div className={`space-y-3 ${className}`} {...props}>
                {Array.from({ length: limit }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 h-5 bg-muted animate-pulse rounded" />
                    </div>
                ))}
            </div>
        )
    }

    // Empty States
    if (!articles.length) {
        if (style === "gradient") {
            return (
                <div
                    className={`relative rounded-3xl overflow-hidden flex ${className}`}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                    {...props}
                >
                    <div className="flex items-center justify-center px-6 py-12">
                        <h2
                            className="text-xs font-bold tracking-[0.3em] text-white/90 whitespace-nowrap"
                            style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed'
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                    <div className="flex-1 py-8 pr-8">
                        <p className="text-white/70 text-center py-8">No articles found</p>
                    </div>
                </div>
            )
        }

        return (
            <Card className={className} {...props}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No articles found</p>
                </CardContent>
            </Card>
        )
    }

    // Render based on style
    return (
        <>
            {/* Gradient Style - Original vibrant design */}
            {style === "gradient" && (
                <div
                    className={`relative rounded-3xl overflow-hidden flex ${className}`}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                    {...props}
                >
                    <div className="flex items-center justify-center px-6 py-12">
                        <h2
                            className="text-xs font-bold tracking-[0.3em] text-white/90 whitespace-nowrap"
                            style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed'
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                    <div className="flex-1 py-8 pr-8 space-y-0">
                        {articles.slice(0, limit).map((article, index) => (
                            <Link
                                key={article.id}
                                href={`/article/${article.slug}`}
                                className="group block py-6 border-b border-white/20 last:border-0 transition-all hover:bg-white/5 px-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg group-hover:scale-110 transition-transform"
                                        style={{
                                            backgroundColor: index === 0 ? '#10b981' :
                                                index === 1 ? '#059669' :
                                                    index === 2 ? '#047857' :
                                                        index === 3 ? '#065f46' : '#064e3b'
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors leading-tight">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-emerald-400 font-semibold uppercase tracking-wide">
                                                {article.author?.name || "Anonymous"}
                                            </span>
                                            <span className="text-white/70">
                                                {new Date(article.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                }).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Numbered Style - Big bold numbers */}
            {style === "numbered" && (
                <div className={`space-y-4 ${className}`} {...props}>
                    {articles.slice(0, limit).map((article, index) => (
                        <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group flex items-start gap-6 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="text-5xl font-black text-primary/20 group-hover:text-primary/30 transition-colors leading-none pt-1">
                                {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                    {article.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{article.author?.name || "Anonymous"}</span>
                                    <span>•</span>
                                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Classic Style - Clean card-based list */}
            {style === "classic" && (
                <Card className={className} {...props}>
                    <CardHeader>
                        <CardTitle className="text-2xl">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {articles.slice(0, limit).map((article, index) => (
                                <Link
                                    key={article.id}
                                    href={`/article/${article.slug}`}
                                    className="group flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                                            {article.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(article.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Compact Style - Minimal design */}
            {style === "compact" && (
                <div className={`space-y-2 ${className}`} {...props}>
                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">
                        {title}
                    </h3>
                    {articles.slice(0, limit).map((article, index) => (
                        <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                                    {article.title}
                                </h4>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}
