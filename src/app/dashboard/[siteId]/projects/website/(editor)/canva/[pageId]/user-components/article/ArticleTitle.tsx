"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useArticle } from "./ArticleContext"
import { cn } from "@/lib/utils"
import { ArticleTitleSettings } from "./ArticleTitleSettings"

export interface ArticleTitleProps {
    textAlign?: "left" | "center" | "right"
    blockStyle?: BlockStyle
    className?: string
}

export const ArticleTitle = defineBlock<ArticleTitleProps>({
    name: "ArticleTitle",
    category: "Article",
    icon: <div className="p-1">T</div>,

    defaultProps: {
        textAlign: "center",
        blockStyle: {},
    },

    settings: ArticleTitleSettings,

    render: ({ textAlign, className = "", blockStyle }) => {
        const { article, loading, error, isEditor } = useArticle()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...blockStyle,
                // Apply specific overrides if present in blockStyle, or fallback to defaults
                textAlign: blockStyle?.textAlign || textAlign || 'center',
                fontFamily: 'var(--design-font-heading, Georgia, serif)',
                color: blockStyle?.color || 'var(--design-primary, inherit)',
                fontSize: blockStyle?.fontSize,
                fontWeight: blockStyle?.fontWeight,
            },
            className: cn("text-2xl md:text-3xl lg:text-4xl font-bold leading-tight", className)
        })

        // Loading skeleton
        if (loading) {
            return (
                <div
                    className={cn(
                        "h-12 bg-muted/50 animate-pulse rounded w-3/4",
                        textAlign === 'center' ? 'mx-auto' : '',
                        className
                    )}
                />
            )
        }

        // Error or no article
        if (error || !article) {
            return (
                <h1
                    className={cn("text-muted-foreground", computedClassName)}
                    style={computedStyle}
                >
                    {isEditor ? "Article Title" : "No article found"}
                </h1>
            )
        }

        return (
            <h1
                className={computedClassName}
                style={computedStyle}
            >
                {article.title}
            </h1>
        )
    }
})

export default ArticleTitle
