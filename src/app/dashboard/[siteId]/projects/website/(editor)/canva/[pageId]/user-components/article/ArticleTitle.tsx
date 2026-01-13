"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useArticle } from "./ArticleContext"
import { cn } from "@/lib/utils"

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

    settingsConfig: {
        textAlign: {
            label: "Alignment",
            type: "select",
            section: "Style",
            options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
            ],
        },
    },

    render: ({ textAlign = "center", className = "", blockStyle }) => {
        const { article, loading, error, isEditor } = useArticle()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...blockStyle,
                textAlign,
                fontFamily: 'var(--design-font-heading, Georgia, serif)',
                color: blockStyle?.color || 'var(--design-primary, inherit)',
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
