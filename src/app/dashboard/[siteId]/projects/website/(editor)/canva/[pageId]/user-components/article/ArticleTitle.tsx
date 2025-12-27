"use client"

import React, { forwardRef } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../lib/withCraftComponent"
import { useArticle } from "./ArticleContext"

interface ArticleTitleProps extends CraftComponentProps {
    textAlign?: "left" | "center" | "right"
}

const ArticleTitleBase = forwardRef<HTMLHeadingElement, ArticleTitleProps>(
    ({ textAlign = "center", className = "" }, ref) => {
        const { article, loading, error, isEditor } = useArticle()

        // Loading skeleton
        if (loading) {
            return (
                <div
                    ref={ref as React.Ref<HTMLDivElement>}
                    className={`h-12 bg-muted/50 animate-pulse rounded w-3/4 ${textAlign === 'center' ? 'mx-auto' : ''} ${className}`}
                />
            )
        }

        // Error or no article
        if (error || !article) {
            return (
                <h1
                    ref={ref}
                    className={`text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-muted-foreground ${className}`}
                    style={{
                        textAlign,
                        fontFamily: 'var(--design-font-heading, Georgia, serif)',
                    }}
                >
                    {isEditor ? "Article Title" : "No article found"}
                </h1>
            )
        }

        return (
            <h1
                ref={ref}
                className={`text-2xl md:text-3xl lg:text-4xl font-bold leading-tight ${className}`}
                style={{
                    textAlign,
                    fontFamily: 'var(--design-font-heading, Georgia, serif)',
                    color: 'var(--design-primary, inherit)',
                }}
            >
                {article.title}
            </h1>
        )
    }
)

ArticleTitleBase.displayName = "ArticleTitleBase"

const defaultProps: Partial<ArticleTitleProps> = {
    textAlign: "center",
}

export const ArticleTitle = withCraftComponent<ArticleTitleProps, HTMLHeadingElement>(
    ArticleTitleBase,
    {
        displayName: "ArticleTitle",
        defaultProps,
        sectionTitle: "Title",
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
    }
)

export default ArticleTitle
