"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useTeam } from "@/hooks/useTeam"
import axios from "axios"
import Image from "./Image"

interface Article {
  id: string
  title: string
  excerpt: string
  author: {
    name: string | null
  }
  cover: string | null
  createdAt: Date
}

interface ArticleListProps {
  title?: string
  thumbnail?: boolean
  limit?: number
}

export default function ArticleList({
  title = "Latest Articles",
  thumbnail = false,
  limit = 10,
}: ArticleListProps) {
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
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
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
            <div
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
