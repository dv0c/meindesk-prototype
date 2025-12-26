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

export const Image = ({
    src = "https://placehold.co/600x400/e2e8f0/64748b?text=Image",
    alt = "Image",
    width = "100%",
    height = "auto",
    objectFit = "cover",
    borderRadius = 0,
    className = "",
}: ImageProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const style: React.CSSProperties = {
        width,
        height,
        objectFit,
        borderRadius,
        display: "block",
    }

    return (
        <img
            ref={(ref) => {
                if (ref) connect(drag(ref))
            }}
            src={src}
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

    const dimensionsSummary = `${width} × ${height}`

    return (
        <div>
            <PropertySection title="Source">
                <PropertyRow label="Image">
                    <div className="flex flex-col gap-2 w-full">
                        {src ? (
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
                                className="w-full flex items-center justify-center gap-2 h-20 border-dashed"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                <span className="text-muted-foreground">Select Image</span>
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
            </PropertySection>

            <PropertySection title="Dimensions" summary={dimensionsSummary}>
                <PropertyRow label="Width">
                    <PropertyInput
                        value={width || "100%"}
                        onChange={(v) => setProp((props: ImageProps) => (props.width = v))}
                        placeholder="100%"
                    />
                </PropertyRow>
                <PropertyRow label="Height">
                    <PropertyInput
                        value={height || "auto"}
                        onChange={(v) => setProp((props: ImageProps) => (props.height = v))}
                        placeholder="auto"
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
