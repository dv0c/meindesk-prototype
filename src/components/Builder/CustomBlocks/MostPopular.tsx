"use client"

import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"

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
    className?: string
    [key: string]: any
}

export default function MostPopular({
    title = "MOST POPULAR",
    limit = 5,
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

    if (loading || teamLoading) {
        return (
            <div
                className={`relative rounded-3xl overflow-hidden flex ${className}`}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
                {...props}
            >
                {/* Vertical Title */}
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

                {/* Articles List */}
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

    if (!articles.length) {
        return (
            <div
                className={`relative rounded-3xl overflow-hidden flex ${className}`}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
                {...props}
            >
                {/* Vertical Title */}
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

                {/* Empty State */}
                <div className="flex-1 py-8 pr-8">
                    <p className="text-white/70 text-center py-8">No articles found</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`relative rounded-3xl overflow-hidden flex ${className}`}
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            {...props}
        >
            {/* Vertical Title on Left */}
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

            {/* Articles List */}
            <div className="flex-1 py-8 pr-8 space-y-0">
                {articles.slice(0, limit).map((article, index) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group block py-6 border-b border-white/20 last:border-0 transition-all hover:bg-white/5 px-6"
                    >
                        <div className="flex items-start gap-4">
                            {/* Number Badge */}
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

                            {/* Content */}
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
    )
}
