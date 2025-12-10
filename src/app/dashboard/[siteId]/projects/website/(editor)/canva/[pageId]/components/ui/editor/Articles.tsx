"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "./Image"

interface Article {
  id: string
  title: string
  excerpt: string
  slug: string
  author: {
    name: string | null
  }
  categories: String[]
  cover: string | null
  createdAt: Date
}

interface ArticleListProps {
  title?: string
  thumbnail?: boolean
  limit?: number
  style?: "boxed" | "simple" | "minimal" | "magazine"
  category?: string
}

export default function Articles({
  title = "Latest Articles",
  thumbnail = false,
  limit = 10,
  style = "magazine",
  category = "ARTICLES"
}: ArticleListProps) {
  console.log('Articles component rendered with style:', style)
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
        console.log(data)
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
    // Magazine style skeleton
    if (style === "magazine") {
      return (
        <div className="space-y-0">
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
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-48 mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: limit }).map((i) => (
                <div key={i as any} className="border-b pb-4 last:border-0 flex gap-3">
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
        <div className="space-y-4">
          {Array.from({ length: limit }).map((i) => (
            <div key={i as any} className="border-b pb-4 last:border-0 flex gap-3">
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
      <div className="space-y-4">
        {Array.from({ length: limit }).map((i) => (
          <div key={i as any} className="border-b pb-4 last:border-0 flex gap-3">
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

  if (!articles.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No articles found</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground py-8 text-center">
          Nothing to read here yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {style === "boxed" && (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Showing {articles.length} article{articles.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.map((article) => (
                <Link href={`/article/${article.slug}`}
                  key={article.id}
                  className="border-b pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row gap-3"
                >
                  {thumbnail && article.cover && (
                    <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={article.cover}
                        alt={article.title}
                        className="object-cover! w-full h-full!"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{article.author?.name || "Anonymous"}</span>
                      <span>•</span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {style === "simple" && (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link href={`/article/${article.slug}`}
              key={article.id}
              className="border-b pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row gap-3"
            >
              {thumbnail && article.cover && (
                <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={article.cover}
                    alt={article.title}
                    className="object-cover! w-full h-full!"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{article.author?.name || "Anonymous"}</span>
                  <span>•</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {style === "minimal" && (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link href={`/article/${article.slug}`}
              key={article.id}
              className="border-b pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row gap-3"
            >
              {thumbnail && article.cover && (
                <div className="w-full sm:w-80 h-64 overflow-hidden bg-muted">
                  <Image
                    src={article.cover}
                    alt={article.title}
                    className="object-cover! w-full h-full!"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-2xl max-w-xl mb-1">{article.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 max-w-xl line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{article.author?.name || "Anonymous"}</span>
                  <span>•</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {style === "magazine" && (
        <div className="space-y-0">
          {articles.map((article, index) => (
            <Link
              href={`/article/${article.slug}`}
              key={article.id}
              className="group border-b border-border py-8 flex items-center gap-6 hover:bg-muted/50 transition-colors"
            >
              {/* Vertical Category Label */}
              <div className="hidden md:flex items-center justify-center min-w-[80px]">
                <span
                  className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed'
                  }}
                >
                  {article.categories[0] || category}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-emerald-500 font-semibold uppercase tracking-wide">
                    {article.author?.name || "Anonymous"}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {/* <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {Math.floor(Math.random() * 20)}
                  </span> */}
                </div>
              </div>

              {/* Thumbnail */}
              {thumbnail && article.cover && (
                <div className="w-32 h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 flex-shrink-0 overflow-hidden bg-muted">
                  <Image
                    src={article.cover}
                    alt={article.title}
                    className="object-cover! w-full h-full! group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
