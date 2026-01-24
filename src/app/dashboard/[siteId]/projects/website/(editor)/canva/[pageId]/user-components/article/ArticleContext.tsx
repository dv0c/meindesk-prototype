"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import { useParams } from "next/navigation"
import axios from "axios"
import { useEditor } from "@craftjs/core"

/**
 * Article data structure
 */
export interface Author {
    id: string
    name: string | null
    email: string | null
    image: string | null
}

export interface ArticleData {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    html: string
    cover: string | null
    status: string
    categories: string[]
    author: Author | null
    createdAt: string
    updatedAt: string
    metadata?: {
        readingTime?: number
        seo?: any
        [key: string]: any
    }
    site: {
        id: string
        title: string
    }
}

/**
 * Context value interface
 */
interface ArticleContextValue {
    article: ArticleData | null
    loading: boolean
    error: string | null
    isEditor: boolean
}

/**
 * Placeholder article for editor preview
 */
const placeholderArticle: ArticleData = {
    id: "preview",
    title: "Sample Article Title",
    slug: "sample-article",
    excerpt: "This is a preview of how your article will look. In the live site, actual article content will be displayed here based on the URL.",
    html: `<p>This is a preview of the article content. When viewing the actual page, the real article content will be displayed here.</p>
    <p>The article component automatically fetches the article based on the URL slug. For example, visiting <code>/article/my-post</code> will display the article with the slug "my-post".</p>
    <h2>Features</h2>
    <ul>
        <li>Automatic article loading based on URL</li>
        <li>Cover image support</li>
        <li>Author information</li>
        <li>Category tags</li>
        <li>Responsive layout</li>
    </ul>`,
    content: "<p>Preview</p>",
    cover: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop",
    status: "PUBLISHED",
    categories: ["Technology", "Tutorial"],
    author: {
        id: "preview-author",
        name: "John Doe",
        email: "john@example.com",
        image: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    site: {
        id: "preview-site",
        title: "Preview Site",
    },
}

/**
 * Article Context
 */
const ArticleContext = createContext<ArticleContextValue | null>(null)

/**
 * Hook to access article data from context
 */
export function useArticle() {
    const context = useContext(ArticleContext)
    if (!context) {
        // Return safe defaults when used outside of provider
        return {
            article: null,
            loading: false,
            error: "Article blocks must be used within an ArticleProvider or on an article page",
            isEditor: false,
        }
    }
    return context
}

/**
 * ArticleProvider component
 * Fetches article data and provides it to all child article blocks
 */
export function ArticleProvider({ children }: { children: React.ReactNode }) {
    const [article, setArticle] = useState<ArticleData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
    const params = useParams()

    // Check if we're in the editor
    let isEditor = false
    try {
        const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
        isEditor = enabled
    } catch {
        isEditor = false
    }

    // Get article slug from URL
    const articleSlug = params?.slug as string

    useEffect(() => {
        // In editor mode, show placeholder
        if (isEditor) {
            setArticle(placeholderArticle)
            setLoading(false)
            return
        }

        // Need team and slug to fetch
        if (!team?.id || !articleSlug) {
            setError("No article specified")
            setLoading(false)
            return
        }

        const controller = new AbortController()

        const loadArticle = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data } = await axios.get(
                    `/api/v1/${team.id}/articles/${articleSlug}`,
                    { signal: controller.signal }
                )

                setArticle(data)
            } catch (err: any) {
                if (axios.isCancel(err)) return
                console.error("Failed to load article:", err)
                setError(err.response?.data?.error || "Failed to load article")
            } finally {
                setLoading(false)
            }
        }

        loadArticle()
        return () => controller.abort()
    }, [team?.id, articleSlug, isEditor])

    const value: ArticleContextValue = {
        article,
        loading: loading || teamLoading,
        error,
        isEditor,
    }

    return (
        <ArticleContext.Provider value={value}>
            {children}
        </ArticleContext.Provider>
    )
}
