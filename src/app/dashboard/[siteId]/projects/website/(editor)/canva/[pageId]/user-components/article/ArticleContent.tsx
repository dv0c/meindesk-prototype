"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useArticle } from "./ArticleContext"
import { cn } from "@/lib/utils"

export interface ArticleContentProps {
    maxWidth?: string
    blockStyle?: BlockStyle
    className?: string
}

export const ArticleContent = defineBlock<ArticleContentProps>({
    name: "ArticleContent",
    category: "Article",
    icon: <div className="p-1">C</div>,

    defaultProps: {
        maxWidth: "800px",
        blockStyle: {},
    },

    settingsConfig: {
        maxWidth: {
            label: "Max Width",
            type: "text",
            section: "Layout",
            placeholder: "800px",
        },
    },

    render: ({ maxWidth = "800px", className = "", blockStyle }) => {
        const { article, loading, error, isEditor } = useArticle()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...blockStyle,
                maxWidth,
                fontFamily: 'var(--design-font-base, Georgia, serif)',
                color: blockStyle?.color || 'var(--design-neutral, inherit)',
            },
            className: cn(
                "prose prose-lg max-w-none dark:prose-invert",
                "prose-headings:font-bold prose-headings:tracking-tight",
                "prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6",
                "prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-4",
                "prose-p:leading-relaxed prose-p:mb-6",
                "prose-a:text-primary prose-a:no-underline prose-a:hover:underline",
                "prose-strong:font-semibold",
                "prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-muted-foreground",
                "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
                "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
                "prose-img:rounded-lg prose-img:shadow-md",
                "prose-ul:my-6 prose-ol:my-6 prose-li:my-2",
                className
            )
        })

        // Loading skeleton
        if (loading) {
            return (
                <div className={className} style={{ maxWidth }}>
                    <div className="space-y-4">
                        <div className="h-5 bg-muted/50 animate-pulse rounded w-full" />
                        <div className="h-5 bg-muted/50 animate-pulse rounded w-full" />
                        <div className="h-5 bg-muted/50 animate-pulse rounded w-3/4" />
                        <div className="h-5 bg-muted/50 animate-pulse rounded w-full" />
                        <div className="h-5 bg-muted/50 animate-pulse rounded w-5/6" />
                    </div>
                </div>
            )
        }

        // Error or no article
        if (error || !article) {
            return (
                <div
                    className={cn("text-muted-foreground", computedClassName)}
                    style={computedStyle}
                >
                    {isEditor ? (
                        <p>Article content will appear here</p>
                    ) : (
                        <p>No content available</p>
                    )}
                </div>
            )
        }

        return (
            <div
                className={computedClassName}
                style={computedStyle}
                dangerouslySetInnerHTML={{ __html: article.html || article.content }}
            />
        )
    }
})

export default ArticleContent
