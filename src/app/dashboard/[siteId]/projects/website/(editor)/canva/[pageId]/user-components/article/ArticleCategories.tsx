"use client"

import React, { forwardRef } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../lib/withCraftComponent"
import { useArticle } from "./ArticleContext"

interface ArticleCategoriesProps extends CraftComponentProps {
    // No additional props needed - styling from design tokens
}

const ArticleCategoriesBase = forwardRef<HTMLDivElement, ArticleCategoriesProps>(
    ({ className = "" }, ref) => {
        const { article, loading, error, isEditor } = useArticle()

        // Loading skeleton
        if (loading) {
            return (
                <div ref={ref} className={`flex flex-wrap gap-2 ${className}`}>
                    <div className="h-6 bg-muted/50 animate-pulse rounded-full w-20" />
                    <div className="h-6 bg-muted/50 animate-pulse rounded-full w-16" />
                </div>
            )
        }

        // No categories
        if (!article?.categories || article.categories.length === 0) {
            if (isEditor) {
                return (
                    <div ref={ref} className={`flex flex-wrap gap-2 ${className}`}>
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
            <div ref={ref} className={`flex flex-wrap gap-2 ${className}`}>
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
)

ArticleCategoriesBase.displayName = "ArticleCategoriesBase"

const defaultProps: Partial<ArticleCategoriesProps> = {}

export const ArticleCategories = withCraftComponent<ArticleCategoriesProps, HTMLDivElement>(
    ArticleCategoriesBase,
    {
        displayName: "ArticleCategories",
        defaultProps,
        sectionTitle: "Categories",
        settingsConfig: {},
    }
)

export default ArticleCategories
