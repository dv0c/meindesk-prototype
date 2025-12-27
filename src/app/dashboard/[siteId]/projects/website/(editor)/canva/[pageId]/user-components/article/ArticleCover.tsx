"use client"

import React from "react"
import { useNode } from "@craftjs/core"
import { useArticle } from "./ArticleContext"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyInput,
    PropertySelect,
    PropertyCheckbox,
} from "../../components/PropertySection"

interface ArticleCoverProps {
    aspectRatio?: "16:9" | "4:3" | "2:1" | "1:1" | "auto"
    objectFit?: "cover" | "contain"
    borderRadius?: number
    width?: string
    height?: string
    className?: string
    enableSnapping?: boolean
}

const aspectRatioMap = {
    "16:9": "aspect-[16/9]",
    "4:3": "aspect-[4/3]",
    "2:1": "aspect-[2/1]",
    "1:1": "aspect-square",
    "auto": "",
}

export const ArticleCover = ({
    aspectRatio = "16:9",
    objectFit = "cover",
    borderRadius = 8,
    width = "100%",
    height = "auto",
    className = "",
    enableSnapping = false,
}: ArticleCoverProps) => {
    const {
        connectors: { connect, drag },
    } = useNode()

    const { article, loading, isEditor } = useArticle()

    const style = {
        width,
        height,
        borderRadius,
        position: 'relative' as const, // Ensure it can contain absolute children if needed, though current implementation doesn't use them
    }

    // Loading skeleton
    if (loading) {
        return (
            <div
                ref={(ref) => { if (ref) connect(drag(ref)) }}
                className={`bg-muted/50 animate-pulse ${aspectRatioMap[aspectRatio]} ${className}`}
                style={style}
            />
        )
    }

    // No cover image
    if (!article?.cover) {
        if (isEditor) {
            return (
                <div
                    ref={(ref) => { if (ref) connect(drag(ref)) }}
                    className={`bg-muted/30 flex items-center justify-center ${aspectRatioMap[aspectRatio]} ${className}`}
                    style={style}
                >
                    <span className="text-muted-foreground text-sm">No cover image</span>
                </div>
            )
        }
        return null
    }

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)) }}
            className={`overflow-hidden ${aspectRatioMap[aspectRatio]} ${className}`}
            style={style}
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

export const ArticleCoverSettings = () => {
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

ArticleCover.craft = {
    displayName: "ArticleCover",
    props: {
        aspectRatio: "16:9",
        objectFit: "cover",
        borderRadius: 8,
        width: "100%",
        height: "auto",
        enableSnapping: false,
    },
    related: {
        settings: ArticleCoverSettings,
    },
    custom: {
        resizable: true,
    },
}

export default ArticleCover
