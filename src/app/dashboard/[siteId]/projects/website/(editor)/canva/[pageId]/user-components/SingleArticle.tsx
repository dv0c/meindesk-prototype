"use client"

import React, { useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import { useParams, usePathname } from "next/navigation"
import axios from "axios"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useEditor } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { sanitizeRichHtml } from "@/lib/security/sanitize-html"

interface Author {
    id: string
    name: string | null
    email: string | null
    image: string | null
}

interface ArticleData {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    cover: string | null
    html: string
    status: string
    categories: string[]
    author: Author | null
    createdAt: string
    updatedAt: string
    site: {
        id: string
        title: string
    }
}

export interface SingleArticleProps {
    // Layout options
    showCover?: boolean
    showAuthor?: boolean
    showDate?: boolean
    showCategories?: boolean

    // Styling
    titleSize?: "sm" | "md" | "lg" | "xl"
    contentMaxWidth?: string

    // For editor preview only
    previewArticleId?: string

    // Block styles
    blockStyle?: BlockStyle
    className?: string
}

// Placeholder article for editor preview
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

export const SingleArticle = defineBlock<SingleArticleProps>({
    name: "SingleArticle",
    category: "Content",
    icon: <div className="p-1">📝</div>,

    defaultProps: {
        showCover: true,
        showAuthor: true,
        showDate: true,
        showCategories: true,
        titleSize: "xl",
        contentMaxWidth: "800px",
        blockStyle: {},
    },

    settingsConfig: {
        // Display Section
        showCover: { label: "Show Cover Image", type: "checkbox", section: "Display" },
        showAuthor: { label: "Show Author", type: "checkbox", section: "Display" },
        showDate: { label: "Show Date", type: "checkbox", section: "Display" },
        showCategories: { label: "Show Categories", type: "checkbox", section: "Display" },

        // Layout Section
        titleSize: {
            label: "Title Size",
            type: "select",
            section: "Layout",
            options: [
                { label: "Small", value: "sm" },
                { label: "Medium", value: "md" },
                { label: "Large", value: "lg" },
                { label: "Extra Large", value: "xl" },
            ],
        },
        contentMaxWidth: {
            label: "Content Max Width",
            type: "text",
            placeholder: "800px",
            section: "Layout"
        },
    },

    render: ({
        showCover = true,
        showAuthor = true,
        showDate = true,
        showCategories = true,
        titleSize = "xl",
        contentMaxWidth = "800px",
        previewArticleId,
        className = "",
        blockStyle,
    }) => {
        const [article, setArticle] = useState<ArticleData | null>(null)
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)

        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
        const params = useParams()
        // const pathname = usePathname() // Unused

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: blockStyle,
            className: cn("w-full", className)
        })

        // Check if we're in the editor
        let isEditor = false
        try {
            const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
            isEditor = enabled
        } catch {
            isEditor = false
        }

        // Get article slug from URL - handle both /article/[slug] patterns
        const articleSlug = params?.slug as string

        useEffect(() => {
            // In editor mode, show placeholder
            if (isEditor && !previewArticleId) {
                setArticle(placeholderArticle)
                setLoading(false)
                return
            }

            // Need team and slug to fetch
            const slugToFetch = previewArticleId || articleSlug
            if (!team?.id || !slugToFetch) {
                if (!isEditor) {
                    setError("No article specified")
                }
                setLoading(false)
                return
            }

            const controller = new AbortController()

            const loadArticle = async () => {
                try {
                    setLoading(true)
                    setError(null)

                    const { data } = await axios.get(
                        `/api/v1/${team.id}/articles/${slugToFetch}`,
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
        }, [team?.id, articleSlug, previewArticleId, isEditor])

        // Title size classes
        const titleSizeClasses = {
            sm: "text-2xl md:text-3xl",
            md: "text-3xl md:text-4xl",
            lg: "text-4xl md:text-5xl",
            xl: "text-4xl md:text-5xl lg:text-6xl",
        }

        // Loading state
        if (loading || teamLoading) {
            return (
                <div className={computedClassName} style={computedStyle}>
                    <div className="mx-auto" style={{ maxWidth: contentMaxWidth }}>
                        {showCover && (
                            <div className="w-full aspect-[2/1] bg-muted animate-pulse rounded-lg mb-8" />
                        )}
                        <div className="space-y-4">
                            <div className="h-12 bg-muted animate-pulse rounded w-3/4" />
                            <div className="flex items-center gap-4">
                                <div className="h-4 bg-muted animate-pulse rounded w-32" />
                                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            </div>
                            <div className="space-y-3 pt-8">
                                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        // Error state
        if (error) {
            return (
                <div className={computedClassName} style={computedStyle}>
                    <div className="mx-auto text-center py-16" style={{ maxWidth: contentMaxWidth }}>
                        <h2 className="text-2xl font-bold text-destructive mb-2">Article Not Found</h2>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </div>
            )
        }

        // No article
        if (!article) {
            return (
                <div className={computedClassName} style={computedStyle}>
                    <div className="mx-auto text-center py-16" style={{ maxWidth: contentMaxWidth }}>
                        <p className="text-muted-foreground">No article to display</p>
                    </div>
                </div>
            )
        }

        return (
            <div className={computedClassName} style={computedStyle}>
                <article className="mx-auto" style={{ maxWidth: contentMaxWidth }}>
                    {/* Cover Image */}
                    {showCover && article.cover && (
                        <div className="w-full aspect-[2/1] overflow-hidden rounded-lg mb-8">
                            <img
                                src={article.cover}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Categories */}
                    {showCategories && article.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {article.categories.map((cat, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className={`${titleSizeClasses[titleSize]} font-bold leading-tight mb-6`}>
                        {article.title}
                    </h1>

                    {/* Meta info */}
                    {(showAuthor || showDate) && (
                        <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-8 border-b">
                            {showAuthor && article.author && (
                                <div className="flex items-center gap-2">
                                    {article.author.image ? (
                                        <img
                                            src={article.author.image}
                                            alt={article.author.name || "Author"}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-primary font-semibold">
                                                {(article.author.name || "A")[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="font-medium text-foreground">
                                        {article.author.name || "Anonymous"}
                                    </span>
                                </div>
                            )}
                            {showDate && (
                                <time className="text-sm">
                                    {new Date(article.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            )}
                        </div>
                    )}

                    {/* Excerpt - styled lead paragraph */}
                    {article.excerpt && (
                        <div
                            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(article.excerpt) }}
                            className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 font-light italic border-l-4 border-primary/30 pl-6"
                        />
                    )}

                    {/* Content - rich article body */}
                    <div
                        className="
                            prose prose-lg md:prose-xl max-w-none dark:prose-invert
                            prose-headings:font-bold prose-headings:tracking-tight
                            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6
                            prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6
                            prose-a:text-primary prose-a:no-underline prose-a:hover:underline
                            prose-strong:text-foreground prose-strong:font-semibold
                            prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-muted-foreground
                            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-muted prose-pre:border prose-pre:border-border
                            prose-img:rounded-lg prose-img:shadow-md
                            prose-ul:my-6 prose-ol:my-6 prose-li:my-2
                            first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary
                        "
                        style={{ fontFamily: 'var(--design-font-base, Georgia, serif)' }}
                        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(article.html) }}
                    />
                </article>
            </div>
        )
    }
})

export default SingleArticle
