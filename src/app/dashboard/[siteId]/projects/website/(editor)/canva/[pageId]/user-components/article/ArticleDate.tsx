"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useArticle } from "./ArticleContext"
import { cn } from "@/lib/utils"

export interface ArticleDateProps {
    format?: "short" | "long" | "relative"
    locale?: string
    blockStyle?: BlockStyle
    className?: string
}

/**
 * Format date based on format option
 */
function formatDate(dateString: string, format: "short" | "long" | "relative", locale: string): string {
    const date = new Date(dateString)
    const now = new Date()

    if (format === "relative") {
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
        return `${Math.floor(diffDays / 365)} years ago`
    }

    const options: Intl.DateTimeFormatOptions = format === "long"
        ? { year: "numeric", month: "long", day: "numeric" }
        : { year: "numeric", month: "short", day: "numeric" }

    return date.toLocaleDateString(locale, options)
}

export const ArticleDate = defineBlock<ArticleDateProps>({
    name: "ArticleDate",
    category: "Article",
    icon: <div className="p-1">📅</div>,

    defaultProps: {
        format: "long",
        locale: "en-US",
        blockStyle: {},
    },

    settingsConfig: {
        format: {
            label: "Format",
            type: "select",
            section: "Display",
            options: [
                { label: "Short (Jan 1, 2024)", value: "short" },
                { label: "Long (January 1, 2024)", value: "long" },
                { label: "Relative (2 days ago)", value: "relative" },
            ],
        },
        locale: {
            label: "Locale",
            type: "select",
            section: "Display",
            options: [
                { label: "English (US)", value: "en-US" },
                { label: "English (UK)", value: "en-GB" },
                { label: "Greek", value: "el-GR" },
                { label: "German", value: "de-DE" },
                { label: "French", value: "fr-FR" },
            ],
        },
    },

    render: ({ format = "long", locale = "en-US", className = "", blockStyle }) => {
        const { article, loading, error, isEditor } = useArticle()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...blockStyle,
                color: blockStyle?.color || 'var(--design-neutral, inherit)',
                opacity: blockStyle?.opacity ?? 0.7,
            },
            className: cn("text-sm", className)
        })

        // Loading skeleton
        if (loading) {
            return (
                <div className={cn("h-4 bg-muted/50 animate-pulse rounded w-32", className)} />
            )
        }

        // No article
        if (!article) {
            if (isEditor) {
                return (
                    <time
                        className={cn("text-muted-foreground", computedClassName)}
                        style={computedStyle}
                    >
                        {formatDate(new Date().toISOString(), format, locale)}
                    </time>
                )
            }
            return null
        }

        return (
            <time
                dateTime={article.createdAt}
                className={computedClassName}
                style={computedStyle}
            >
                {formatDate(article.createdAt, format, locale)}
            </time>
        )
    }
})

export default ArticleDate
