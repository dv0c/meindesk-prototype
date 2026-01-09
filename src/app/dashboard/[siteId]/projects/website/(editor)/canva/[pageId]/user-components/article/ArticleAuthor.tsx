"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useArticle } from "./ArticleContext"
import { cn } from "@/lib/utils"

export interface ArticleAuthorProps {
    showAvatar?: boolean
    blockStyle?: BlockStyle
    className?: string
}

export const ArticleAuthor = defineBlock<ArticleAuthorProps>({
    name: "ArticleAuthor",
    category: "Article",
    icon: <div className="p-1">👤</div>,

    defaultProps: {
        showAvatar: true,
        blockStyle: {},
    },

    settingsConfig: {
        showAvatar: {
            label: "Show Avatar",
            type: "checkbox",
            section: "Display",
        },
    },

    render: ({ showAvatar = true, className = "", blockStyle }) => {
        const { article, loading, error, isEditor } = useArticle()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: blockStyle,
            className: cn("flex items-center gap-3", className)
        })

        // Loading skeleton
        if (loading) {
            return (
                <div className={computedClassName} style={computedStyle}>
                    {showAvatar && (
                        <div className="w-10 h-10 rounded-full bg-muted/50 animate-pulse" />
                    )}
                    <div className="h-4 bg-muted/50 animate-pulse rounded w-24" />
                </div>
            )
        }

        // No author
        if (!article?.author) {
            if (isEditor) {
                return (
                    <div className={cn("text-muted-foreground", computedClassName)} style={computedStyle}>
                        {showAvatar && (
                            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                                <span className="text-sm">?</span>
                            </div>
                        )}
                        <span className="font-medium">Author Name</span>
                    </div>
                )
            }
            return null
        }

        const author = article.author

        return (
            <div className={computedClassName} style={computedStyle}>
                {showAvatar && (
                    author.image ? (
                        <img
                            src={author.image}
                            alt={author.name || "Author"}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--design-primary, #3b82f6)', opacity: 0.1 }}
                        >
                            <span
                                className="font-semibold"
                                style={{ color: 'var(--design-primary, #3b82f6)' }}
                            >
                                {(author.name || "A")[0].toUpperCase()}
                            </span>
                        </div>
                    )
                )}
                <span
                    className="font-medium"
                    style={{ color: 'var(--design-neutral, inherit)' }}
                >
                    {author.name || "Anonymous"}
                </span>
            </div>
        )
    }
})

export default ArticleAuthor
