"use client"

import React, { forwardRef } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
} from "../../lib/withCraftComponent"
import { useArticle } from "./ArticleContext"

interface ArticleCoverProps extends CraftComponentProps {
    aspectRatio?: "16:9" | "4:3" | "2:1" | "1:1" | "auto"
    objectFit?: "cover" | "contain"
    borderRadius?: number
}

const aspectRatioMap = {
    "16:9": "aspect-[16/9]",
    "4:3": "aspect-[4/3]",
    "2:1": "aspect-[2/1]",
    "1:1": "aspect-square",
    "auto": "",
}

const ArticleCoverBase = forwardRef<HTMLDivElement, ArticleCoverProps>(
    (
        {
            aspectRatio = "16:9",
            objectFit = "cover",
            borderRadius = 8,
            className = "",
        },
        ref
    ) => {
        const { article, loading, error, isEditor } = useArticle()

        // Loading skeleton
        if (loading) {
            return (
                <div
                    ref={ref}
                    className={`w-full bg-muted/50 animate-pulse ${aspectRatioMap[aspectRatio]} ${className}`}
                    style={{ borderRadius }}
                />
            )
        }

        // No cover image
        if (!article?.cover) {
            if (isEditor) {
                return (
                    <div
                        ref={ref}
                        className={`w-full bg-muted/30 flex items-center justify-center ${aspectRatioMap[aspectRatio]} ${className}`}
                        style={{ borderRadius }}
                    >
                        <span className="text-muted-foreground text-sm">No cover image</span>
                    </div>
                )
            }
            return null
        }

        return (
            <div
                ref={ref}
                className={`w-full overflow-hidden ${aspectRatioMap[aspectRatio]} ${className}`}
                style={{ borderRadius }}
            >
                <img
                    src={article.cover}
                    alt={article.title}
                    className="w-full h-full"
                    style={{ objectFit }}
                />
            </div>
        )
    }
)

ArticleCoverBase.displayName = "ArticleCoverBase"

const defaultProps: Partial<ArticleCoverProps> = {
    aspectRatio: "16:9",
    objectFit: "cover",
    borderRadius: 8,
}

export const ArticleCover = withCraftComponent<ArticleCoverProps, HTMLDivElement>(
    ArticleCoverBase,
    {
        displayName: "ArticleCover",
        defaultProps,
        sectionTitle: "Cover Image",
        settingsConfig: {
            aspectRatio: {
                label: "Aspect Ratio",
                type: "select",
                section: "Layout",
                options: [
                    { label: "16:9", value: "16:9" },
                    { label: "4:3", value: "4:3" },
                    { label: "2:1", value: "2:1" },
                    { label: "1:1 (Square)", value: "1:1" },
                    { label: "Auto", value: "auto" },
                ],
            },
            objectFit: {
                label: "Image Fit",
                type: "select",
                section: "Layout",
                options: [
                    { label: "Cover", value: "cover" },
                    { label: "Contain", value: "contain" },
                ],
            },
            borderRadius: {
                label: "Border Radius",
                type: "slider",
                section: "Style",
                min: 0,
                max: 32,
            },
        },
    }
)

export default ArticleCover
