"use client"

import { useNode } from "@craftjs/core"
import { useState } from "react"
import { useParams } from "next/navigation"
import MediaLibraryDialog, { MediaItem } from "@/components/MediaGallery/media-select"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertyInput,
    PropertySelect,
    PropertySliderWithUnit,
} from "../components/PropertySection"

interface ImageProps {
    src?: string
    alt?: string
    width?: string
    height?: string
    objectFit?: "cover" | "contain" | "fill" | "none"
    borderRadius?: number
    className?: string
}

// Add imports
import { useCollectionItem } from "./collections/CollectionItemContext"
import { resolveCollectionTemplate } from "@/lib/collection-utils"

export const Image = ({
    src = "https://placehold.co/600x400/e2e8f0/64748b?text=Image",
    alt = "Image",
    width = "50%",
    height = "auto",
    objectFit = "cover",
    borderRadius = 0,
    className = "",
}: ImageProps) => {
    const {
        connectors: { connect, drag },
    } = useNode()

    const collectionContext = useCollectionItem()

    const resolvedSrc = resolveCollectionTemplate(src, collectionContext?.data)
    const displaySrc = resolvedSrc || src

    const style: React.CSSProperties = {
        width,
        height,
        objectFit,
        borderRadius,
        display: "block",
    }

    return (
        <img
            ref={(ref: any) => connect(drag(ref))}
            src={displaySrc}
            alt={alt}
            className={className}
            style={style}
        />
    )
}

// Settings component for Image
export const ImageSettings = () => {
    const {
        actions: { setProp },
        src,
        alt,
        width,
        height,
        objectFit,
        borderRadius,
    } = useNode((node) => ({
        src: node.data.props.src,
        alt: node.data.props.alt,
        width: node.data.props.width,
        height: node.data.props.height,
        objectFit: node.data.props.objectFit,
        borderRadius: node.data.props.borderRadius,
    }))

    const params = useParams()
    const siteId = params.siteId as string
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleMediaSelect = (items: MediaItem[]) => {
        if (items.length > 0) {
            const selectedImage = items[0]
            setProp((props: ImageProps) => {
                props.src = selectedImage.url
                if (selectedImage.alt) props.alt = selectedImage.alt
            })
        }
    }

    // Helper to parse dimension string (e.g., "100%" -> { value: 100, unit: "%" })
    const parseDimension = (val: string | undefined, defaultVal: number, defaultUnit: string) => {
        if (!val) return { value: defaultVal, unit: defaultUnit }
        // Handle "auto"
        if (val === 'auto') return { value: defaultVal, unit: defaultUnit } // Control doesn't support "auto" well, fallback
        const match = val.toString().match(/^([\d.]+)(px|%|vh|vw|rem)?$/)
        if (match) {
            return {
                value: parseFloat(match[1]),
                unit: match[2] || 'px'
            }
        }
        return { value: defaultVal, unit: defaultUnit }
    }

    const widthDim = parseDimension(width, 100, '%')
    const heightDim = parseDimension(height, 300, 'px') // Use 300px as default fallback visual if auto/unset

    const dimensionsSummary = `${width} × ${height}`

    return (
        <div>
            <PropertySection title="Source">
                <PropertyRow label="Image Source">
                    <PropertyInput
                        value={src || ""}
                        onChange={(v) => setProp((props: ImageProps) => (props.src = v))}
                        placeholder="https://... or {field_name}"
                    />
                </PropertyRow>

                <PropertyRow label="Media Library">
                    <div className="flex flex-col gap-2 w-full">
                        {src && !src.startsWith('{') ? (
                            <div className="relative group w-full aspect-video bg-muted rounded-md overflow-hidden border border-border">
                                <img
                                    src={src}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setIsDialogOpen(true)}
                                    >
                                        Change Image
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center gap-2 h-10 border-dashed"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Select from Library</span>
                            </Button>
                        )}
                    </div>
                </PropertyRow>
                <PropertyRow label="Alt Text">
                    <PropertyInput
                        value={alt || ""}
                        onChange={(v) => setProp((props: ImageProps) => (props.alt = v))}
                        placeholder="Describe the image"
                    />
                </PropertyRow>
                <div className="px-4 pb-2 text-xs text-muted-foreground">
                    Tip: Use <code>{`{field_name}`}</code> in the image source to bind to dynamic data.
                </div>
            </PropertySection>

            <PropertySection title="Dimensions" summary={dimensionsSummary}>
                <PropertyRow label="Width">
                    <PropertySliderWithUnit
                        value={widthDim.value}
                        unit={widthDim.unit}
                        onChange={(val, unit) => setProp((props: ImageProps) => (props.width = `${val}${unit}`))}
                        min={0}
                        max={100} // Let slider adjust based on unit? Component usually handles it.
                        units={["%", "px", "vw"]}
                    />
                </PropertyRow>
                <PropertyRow label="Height">
                    <PropertySliderWithUnit
                        value={heightDim.value}
                        unit={heightDim.unit}
                        onChange={(val, unit) => setProp((props: ImageProps) => (props.height = `${val}${unit}`))}
                        min={0}
                        max={1000}
                        units={["px", "%", "vh"]}
                    />
                </PropertyRow>
                <PropertyRow label="Object Fit">
                    <PropertySelect
                        value={objectFit || "cover"}
                        onChange={(v) => setProp((props: ImageProps) => (props.objectFit = v as ImageProps["objectFit"]))}
                        options={[
                            { label: "Cover", value: "cover" },
                            { label: "Contain", value: "contain" },
                            { label: "Fill", value: "fill" },
                            { label: "None", value: "none" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Corner Radius">
                    <PropertySlider
                        value={borderRadius || 0}
                        onChange={(v) => setProp((props: ImageProps) => (props.borderRadius = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>

            <MediaLibraryDialog
                siteId={siteId}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSelect={handleMediaSelect}
                multiSelect={false}
            />
        </div>
    )
}


Image.craft = {
    displayName: "Image",
    props: {
        src: "https://placehold.co/600x400/e2e8f0/64748b?text=Image",
        alt: "Image",
        width: "100%",
        height: "auto",
        objectFit: "cover",
        borderRadius: 0,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ImageSettings,
    },
}
