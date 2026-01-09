"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useArticle } from "./ArticleContext"
import { cn } from "@/lib/utils"

export interface ArticleCategoriesProps {
    blockStyle?: BlockStyle
    className?: string
}

export const ArticleCategories = defineBlock<ArticleCategoriesProps>({
    name: "ArticleCategories",
    category: "Article",
    icon: <div className="p-1">🏷️</div>,

    defaultProps: {
        blockStyle: {},
    },

    settingsConfig: {},

    render: ({ className = "", blockStyle }) => {
        const { article, loading, error, isEditor } = useArticle()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: blockStyle,
            className: cn("flex flex-wrap gap-2", className)
        })

        // Loading skeleton
        if (loading) {
            return (
                <div className={computedClassName} style={computedStyle}>
                    <div className="h-6 bg-muted/50 animate-pulse rounded-full w-20" />
                    <div className="h-6 bg-muted/50 animate-pulse rounded-full w-16" />
                </div>
            )
        }

        // No categories
        if (!article?.categories || article.categories.length === 0) {
            if (isEditor) {
                return (
                    <div className={computedClassName} style={computedStyle}>
                        <span
                            className="px-3 py-1 text-sm font-medium rounded-full"
                            style={{
                                backgroundColor: 'var(--design-primary, #3b82f6)',
                                opacity: 0.1,
                                color: 'var(--design-primary, #3b82f6)',
                            }}
                        >
                            Category
                        </span>
                        <span
                            className="px-3 py-1 text-sm font-medium rounded-full"
                            style={{
                                backgroundColor: 'var(--design-primary, #3b82f6)',
                                opacity: 0.1,
                                color: 'var(--design-primary, #3b82f6)',
                            }}
                        >
                            Tag
                        </span>
                    </div>
                )
            }
            return null
        }

        return (
            <div className={computedClassName} style={computedStyle}>
                {article.categories.map((category, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium rounded-full"
                        style={{
                            backgroundColor: 'color-mix(in srgb, var(--design-primary, #3b82f6) 10%, transparent)',
                            color: 'var(--design-primary, #3b82f6)',
                        }}
                    >
                        {category}
                    </span>
                ))}
            </div>
        )
    }
})

export default ArticleCategories
