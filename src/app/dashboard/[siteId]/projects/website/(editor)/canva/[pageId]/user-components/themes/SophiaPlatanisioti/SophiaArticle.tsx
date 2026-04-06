"use client"

import React, { forwardRef, useEffect, useState } from "react"
import { useTeam } from "@/hooks/useTeam"
import { useParams } from "next/navigation"
import axios from "axios"
import { defineBlock, useBlockStyles, type BlockStyle } from "@/lib/block-api"
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
    html: string
    cover: string | null
    status: string
    categories: string[]
    author: Author | null
    createdAt: string
    updatedAt: string
    metadata?: {
        readingTime?: number
        [key: string]: any
    }
    site: {
        id: string
        title: string
    }
}

interface SophiaArticleProps {
    // Layout options
    showCover?: boolean
    showAuthor?: boolean
    showDate?: boolean

    // Styling options
    titleColor?: 'primary' | 'secondary' | 'tertiary' | 'background'
    contentColor?: 'primary' | 'secondary' | 'tertiary' | 'background'
    backgroundColor?: 'primary' | 'secondary' | 'tertiary' | 'background'

    // For editor preview only
    previewArticleId?: string

    // Server-side pre-fetched article data (for SSR)
    articleData?: ArticleData
    style?: BlockStyle
    className?: string
    responsive?: { hiddenOn?: string[] }
    isEditing?: boolean
    deviceMode?: "desktop" | "tablet" | "mobile" | null
    [key: string]: any
}

// Helper to map color names to CSS variables
const getColorVar = (color: string) => {
    switch (color) {
        case 'primary': return 'var(--design-primary)'
        case 'secondary': return 'var(--design-secondary)'
        case 'tertiary': return 'var(--design-tertiary)'
        case 'background': return 'var(--design-background)'
        default: return 'var(--design-primary)'
    }
}

// Placeholder article for editor preview
const placeholderArticle: ArticleData = {
    id: "preview",
    title: "Η ψυχική υγεία των παιδιών",
    slug: "sample-article",
    excerpt: null,
    content: "",
    html: `<p>Η Παγκόσμια Ημέρα Ψυχικής Υγείας είναι μια ευκαιρία να στρέψουμε την προσοχή μας σε έναν από τους πιο ευαίσθητους και σημαντικούς τομείς της υγείας: την ψυχική υγεία των παιδιών. Καθώς τα παιδιά μας μεγαλώνουν, είναι κρίσιμο να κατανοήσουμε ότι η ψυχική τους υγεία είναι τόσο σημαντική όσο και η σωματική. Οι γονείς παίζουν έναν καθοριστικό ρόλο στη διαμόρφωση ενός υγιούς συναισθηματικού κόσμου για τα παιδιά τους, και η ευαισθητοποίηση γύρω από αυτό το θέμα είναι περισσότερο αναγκαία από ποτέ.</p>
    <p>Η ψυχική υγεία στην παιδική ηλικία αφορά την συναισθηματική ευεξία, την ικανότητα διαχείρισης του στρες και των προκλήσεων, καθώς και την ανάπτυξη υγιών κοινωνικών σχέσεων. Όταν η ψυχική υγεία των παιδιών δεν λαμβάνεται υπόψη, μπορεί να οδηγήσει σε μακροπρόθεσμα προβλήματα, όπως άγχος, κατάθλιψη και δυσκολίες στις κοινωνικές σχέσεις. Αντίθετα, ένα παιδί που μεγαλώνει σε ένα περιβάλλον που υποστηρίζει την ψυχική του υγεία θα αναπτύξει τα απαραίτητα εργαλεία για να αντιμετωπίσει τις προκλήσεις της ζωής με αυτοπεποίθηση και ανθεκτικότητα.</p>`,
    cover: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1200&h=600&fit=crop",
    status: "PUBLISHED",
    categories: [],
    author: {
        id: "preview-author",
        name: "Σοφία Πλατανησιώτη",
        email: "sophia@example.com",
        image: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    site: {
        id: "preview-site",
        title: "Sophia Platanisioti",
    },
}

const SophiaArticleBase = forwardRef<HTMLDivElement, SophiaArticleProps>(
    (
        {
            showCover = true,
            showAuthor = false,
            showDate = false,
            titleColor = 'primary',
            contentColor = 'primary',
            backgroundColor = 'background',
            previewArticleId,
            articleData,
            className = "",
            responsive,
            isEditing,
            deviceMode,
            nodeId,
        },
        ref
    ) => {
        // Use pre-fetched data if available (SSR mode)
        const [article, setArticle] = useState<ArticleData | null>(articleData || null)
        const [loading, setLoading] = useState(!articleData)
        const [error, setError] = useState<string | null>(null)

        const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
        const params = useParams()

        const isEditor = Boolean(isEditing)

        // Get article slug from URL
        const articleSlug = params?.slug as string

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: { backgroundColor: getColorVar(backgroundColor) },
            className: `w-full ${className}`,
            responsive,
            isEditing,
            deviceMode,
            nodeId,
        })

        useEffect(() => {
            // If article data was provided via props (SSR), skip fetching
            if (articleData) {
                setArticle(articleData)
                setLoading(false)
                return
            }

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
        }, [team?.id, articleSlug, previewArticleId, isEditor, articleData])

        // Loading state
        if (loading || teamLoading) {
            return (
                <div ref={ref} className={computedClassName} style={computedStyle}>
                    <div className="py-12 px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="h-12 bg-muted/50 animate-pulse rounded w-2/3 mx-auto mb-12" />
                            <div className="w-full aspect-[16/9] bg-muted/50 animate-pulse rounded-lg mb-12" />
                            <div className="space-y-4" style={{ maxWidth: '55.5rem', margin: '0 auto' }}>
                                <div className="h-5 bg-muted/50 animate-pulse rounded w-full" />
                                <div className="h-5 bg-muted/50 animate-pulse rounded w-full" />
                                <div className="h-5 bg-muted/50 animate-pulse rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        // Error state
        if (error) {
            return (
                <div ref={ref} className={computedClassName} style={computedStyle}>
                    <div className="py-16 text-center">
                        <h2 className="text-2xl font-bold text-destructive mb-2">Article Not Found</h2>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </div>
            )
        }

        // No article
        if (!article) {
            return (
                <div ref={ref} className={computedClassName} style={computedStyle}>
                    <div className="py-16 text-center">
                        <p className="text-muted-foreground">No article to display</p>
                    </div>
                </div>
            )
        }

        return (
            <div ref={ref} className={computedClassName} style={computedStyle}>
                {/* Hero Section - Cover with Title Overlay */}
                {showCover && article.cover && (
                    <div
                        className="relative w-full"
                        style={{ height: '30vh', minHeight: '200px' }}
                    >
                        {/* Cover Image */}
                        <img
                            src={article.cover}
                            alt={article.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/30" />
                        {/* Title on Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center px-6">
                            <h1
                                className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-center leading-tight"
                                style={{
                                    color: getColorVar(titleColor === 'primary' ? 'tertiary' : titleColor), // Default to tertiary (light) on overlay if primary selected
                                    fontFamily: 'var(--design-font-heading, Literata), Georgia, serif',
                                }}
                            >
                                {article.title}
                            </h1>
                        </div>
                    </div>
                )}

                {/* Title without cover */}
                {(!showCover || !article.cover) && (
                    <div className="py-12 px-6">
                        <h1
                            className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-center leading-tight"
                            style={{
                                color: getColorVar(titleColor),
                                fontFamily: 'var(--design-font-heading, Literata), Georgia, serif',
                            }}
                        >
                            {article.title}
                        </h1>
                    </div>
                )}

                {/* Main Content Area */}
                <article className="py-20">
                    {/* Author and Date - Optional */}
                    {(showAuthor || showDate) && (
                        <div
                            className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-8 px-6"
                            style={{ maxWidth: '55.5rem', margin: '0 auto' }}
                        >
                            {showAuthor && article.author && (
                                <span className="font-medium">{article.author.name}</span>
                            )}
                            {showAuthor && showDate && <span>•</span>}
                            {showDate && (
                                <time>
                                    {new Date(article.createdAt).toLocaleDateString('el-GR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            )}
                            {article.metadata?.readingTime && (
                                <>
                                    <span>•</span>
                                    <span>{article.metadata.readingTime} min read</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Content - Left aligned, using design font */}
                    <div
                        className="px-6"
                        style={{ maxWidth: '55.5rem', margin: '0 auto' }}
                    >
                        <div
                            className="
                                prose prose-lg max-w-none
                                prose-p:text-left prose-p:mb-6
                                prose-headings:text-center prose-headings:font-bold
                                prose-a:text-primary prose-a:no-underline prose-a:hover:underline
                                prose-strong:font-semibold
                                prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:italic prose-blockquote:text-gray-600
                                prose-ul:list-disc prose-ol:list-decimal
                            "
                            style={{
                                fontFamily: 'var(--design-font-base, Literata), Georgia, serif',
                                fontSize: '18px',
                                lineHeight: '32px',
                                color: getColorVar(contentColor),
                            }}
                            dangerouslySetInnerHTML={{
                                __html: sanitizeRichHtml(
                                    article.html ??
                                        (typeof article.content === "string" ? article.content : "")
                                ),
                            }}
                        />
                    </div>
                </article>
            </div>
        )
    }
)

SophiaArticleBase.displayName = "SophiaArticleBase"

// Default props - uses CSS design variables for styling
const defaultProps: Partial<SophiaArticleProps> = {
    showCover: true,
    showAuthor: false,
    showDate: false,
    titleColor: 'primary',
    contentColor: 'primary',
    backgroundColor: 'background',
    responsive: { hiddenOn: [] },
}

export const SophiaArticle = defineBlock<SophiaArticleProps>({
    name: "SophiaArticle",
    category: "Sophia Content",
    description: "Sophia article detail view",
    defaultProps,
    settingsConfig: {
            // Display Section
            showCover: { label: "Show Cover Image", type: "checkbox", section: "Display" },
            showAuthor: { label: "Show Author", type: "checkbox", section: "Display" },
            showDate: { label: "Show Date", type: "checkbox", section: "Display" },

            // Colors Section
            titleColor: {
                label: "Title Color",
                description: "Color of the main article title",
                type: "select",
                section: "Colors",
                options: [
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                    { label: "Tertiary", value: "tertiary" },
                    { label: "Background", value: "background" },
                ]
            },
            contentColor: {
                label: "Content Color",
                description: "Color of the article body text",
                type: "select",
                section: "Colors",
                options: [
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                    { label: "Tertiary", value: "tertiary" },
                    { label: "Background", value: "background" },
                ]
            },
            backgroundColor: {
                label: "Background Color",
                description: "Background color of the article section",
                type: "select",
                section: "Colors",
                options: [
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                    { label: "Tertiary", value: "tertiary" },
                    { label: "Background", value: "background" },
                ]
            },
    },
    render: (props) => <SophiaArticleBase {...props} />,
})

export default SophiaArticle
