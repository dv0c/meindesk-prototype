"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useArticle } from "./ArticleContext"
import { cn } from "@/lib/utils"

export interface ArticleReadingTimeProps {
    suffix?: string
    blockStyle?: BlockStyle
    className?: string
}

export const ArticleReadingTime = defineBlock<ArticleReadingTimeProps>({
    name: "ArticleReadingTime",
    category: "Article",
    icon: <div className="p-1">⏱️</div>,

    defaultProps: {
        suffix: "min read",
        blockStyle: {},
    },

    settingsConfig: {
        suffix: { label: "Suffix", type: "text", section: "Display" },
    },

    render: ({ suffix = "min read", className = "", blockStyle }) => {
        const { article, loading, isEditor } = useArticle()

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
                <div className={cn("h-4 bg-muted/50 animate-pulse rounded w-24", className)} />
            )
        }

        // No article or no reading time
        if (!article?.metadata?.readingTime) {
            if (isEditor) {
                return (
                    <span
                        className={cn("text-muted-foreground", computedClassName)}
                        style={computedStyle}
                    >
                        5 {suffix}
                    </span>
                )
            }
            return <></>
        }

        return (
            <span
                className={computedClassName}
                style={computedStyle}
            >
                {article.metadata.readingTime} {suffix}
            </span>
        )
    }
})

export default ArticleReadingTime
