"use client"

import React from "react"
import { useNode } from "@craftjs/core"
import { useArticle } from "./ArticleContext"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyInput,
    PropertySelect,
    PropertyCheckbox,
} from "../../components/PropertySection"

export interface ArticleCoverProps {
    aspectRatio?: "16:9" | "4:3" | "2:1" | "1:1" | "auto"
    objectFit?: "cover" | "contain"
    borderRadius?: number
    width?: string
    height?: string
    className?: string
    enableSnapping?: boolean
    blockStyle?: BlockStyle
}

const aspectRatioMap = {
    "16:9": "aspect-[16/9]",
    "4:3": "aspect-[4/3]",
    "2:1": "aspect-[2/1]",
    "1:1": "aspect-square",
    "auto": "",
}

const ArticleCoverSettings = () => {
    const {
        actions: { setProp },
        aspectRatio,
        objectFit,
        borderRadius,
        width,
        height,
        enableSnapping,
    } = useNode((node) => ({
        aspectRatio: node.data.props.aspectRatio,
        objectFit: node.data.props.objectFit,
        borderRadius: node.data.props.borderRadius,
        width: node.data.props.width,
        height: node.data.props.height,
        enableSnapping: node.data.props.enableSnapping,
    }))

    const dimensionsSummary = `${width || 'auto'} × ${height || 'auto'}`

    return (
        <div>
            <PropertySection title="Layout">
                <PropertyRow label="Aspect Ratio">
                    <PropertySelect
                        value={aspectRatio || "16:9"}
                        onChange={(v) => setProp((props: ArticleCoverProps) => (props.aspectRatio = v as any))}
                        options={[
                            { label: "16:9", value: "16:9" },
                            { label: "4:3", value: "4:3" },
                            { label: "2:1", value: "2:1" },
                            { label: "1:1 (Square)", value: "1:1" },
                            { label: "Auto", value: "auto" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Image Fit">
                    <PropertySelect
                        value={objectFit || "cover"}
                        onChange={(v) => setProp((props: ArticleCoverProps) => (props.objectFit = v as any))}
                        options={[
                            { label: "Cover", value: "cover" },
                            { label: "Contain", value: "contain" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Dimensions" summary={dimensionsSummary}>
                <PropertyRow label="Width">
                    <PropertyInput
                        value={width || ""}
                        onChange={(v) => setProp((props: ArticleCoverProps) => (props.width = v))}
                        placeholder="100%"
                    />
                </PropertyRow>
                <PropertyRow label="Height">
                    <PropertyInput
                        value={height || ""}
                        onChange={(v) => setProp((props: ArticleCoverProps) => (props.height = v))}
                        placeholder="auto"
                    />
                </PropertyRow>
                <PropertyRow label="Snap to Breakpoints">
                    <div className="flex items-center justify-between pt-1">
                        <label className="text-xs text-muted-foreground">Enabled</label>
                        <PropertyCheckbox
                            id="enableSnapping"
                            label=""
                            checked={enableSnapping}
                            onChange={(checked) => setProp((props: ArticleCoverProps) => (props.enableSnapping = checked))}
                        />
                    </div>
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Style">
                <PropertyRow label="Border Radius">
                    <PropertySlider
                        value={borderRadius || 0}
                        onChange={(v) => setProp((props: ArticleCoverProps) => (props.borderRadius = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const ArticleCover = defineBlock<ArticleCoverProps>({
    name: "ArticleCover",
    category: "Article",
    icon: <div className="p-1">🖼️</div>,

    defaultProps: {
        aspectRatio: "16:9",
        objectFit: "cover",
        borderRadius: 8,
        width: "100%",
        height: "auto",
        enableSnapping: false,
        blockStyle: {},
    },

    settings: ArticleCoverSettings,

    render: ({
        aspectRatio = "16:9",
        objectFit = "cover",
        borderRadius = 8,
        width = "100%",
        height = "auto",
        className = "",
        enableSnapping = false,
        blockStyle,
    }) => {
        const { article, loading, isEditor } = useArticle()

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...blockStyle,
                width,
                height,
                borderRadius,
                position: 'relative'
            },
            className: cn("overflow-hidden", aspectRatioMap[aspectRatio], className)
        })

        // Loading skeleton
        if (loading) {
            return (
                <div
                    className={cn("bg-muted/50 animate-pulse", computedClassName)}
                    style={computedStyle}
                />
            )
        }

        // No cover image
        if (!article?.cover) {
            if (isEditor) {
                return (
                    <div
                        className={cn("bg-muted/30 flex items-center justify-center", computedClassName)}
                        style={computedStyle}
                    >
                        <span className="text-muted-foreground text-sm">No cover image</span>
                    </div>
                )
            }
            return null
        }

        return (
            <div
                className={computedClassName}
                style={computedStyle}
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
})

export default ArticleCover
