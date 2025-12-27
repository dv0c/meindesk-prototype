"use client"

import React, { forwardRef } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../lib/withCraftComponent"
import { useArticle } from "./ArticleContext"

interface ArticleAuthorProps extends CraftComponentProps {
    showAvatar?: boolean
}

const ArticleAuthorBase = forwardRef<HTMLDivElement, ArticleAuthorProps>(
    ({ showAvatar = true, className = "" }, ref) => {
        const { article, loading, error, isEditor } = useArticle()

        // Loading skeleton
        if (loading) {
            return (
                <div ref={ref} className={`flex items-center gap-3 ${className}`}>
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
                    <div ref={ref} className={`flex items-center gap-3 text-muted-foreground ${className}`}>
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
            <div ref={ref} className={`flex items-center gap-3 ${className}`}>
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
)

ArticleAuthorBase.displayName = "ArticleAuthorBase"

const defaultProps: Partial<ArticleAuthorProps> = {
    showAvatar: true,
}

export const ArticleAuthor = withCraftComponent<ArticleAuthorProps, HTMLDivElement>(
    ArticleAuthorBase,
    {
        displayName: "ArticleAuthor",
        defaultProps,
        sectionTitle: "Author",
        settingsConfig: {
            showAvatar: {
                label: "Show Avatar",
                type: "checkbox",
                section: "Display",
            },
        },
    }
)

export default ArticleAuthor
