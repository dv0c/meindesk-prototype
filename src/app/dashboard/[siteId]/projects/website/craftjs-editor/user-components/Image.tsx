"use client"

import { useNode } from "@craftjs/core"
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

    const dimensionsSummary = `${width} × ${height}`

    return (
        <div>
            <PropertySection title="Source">
                <PropertyRow label="Image URL">
                    <PropertyInput
                        type="url"
                        value={src || ""}
                        onChange={(v) => setProp((props: ImageProps) => (props.src = v))}
                        placeholder="https://..."
                    />
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

            <PropertySection title="Decoration" summary={`${borderRadius}px radius`} defaultOpen={false}>
                <PropertyRow label="Border Radius">
                    <PropertySlider
                        value={borderRadius || 0}
                        onChange={(v) => setProp((props: ImageProps) => (props.borderRadius = v))}
                        min={0}
                        max={50}
                    />
                </PropertyRow>
            </PropertySection>
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
