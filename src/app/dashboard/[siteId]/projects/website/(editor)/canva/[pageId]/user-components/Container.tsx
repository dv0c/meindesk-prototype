"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { Plus } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useCollectionData } from "@/hooks/useCollectionData"
import { CollectionItemProvider } from "./collections/CollectionItemContext"
import { resolveCollectionTemplate } from "@/lib/collection-utils"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyBoxModel,
    PropertyColor,
    PropertySelect,
    PropertyShadowSelect,
    PropertyInput
} from "../components/PropertySection"

// Container Props Interface
export interface ContainerProps {
    children?: React.ReactNode
    style?: BlockStyle
    className?: string

    // Collection Data Props
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
}

// Default Styles
const defaultStyles: BlockStyle = {
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    minHeight: 100,
    width: "100%",
    height: "auto",
    display: "block",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#e5e7eb",
    position: "relative"
}

const ContainerSettings = () => {
    const { actions: { setProp }, style, collectionId } = useNode((node) => ({
        style: node.data.props.style || {},
        collectionId: node.data.props.collectionId
    }))

    const handleStyleChange = (key: string, value: any) => {
        setProp((props: any) => {
            if (!props.style) props.style = {}
            props.style[key] = value
        })
    }

    const handleBoxModelChange = (type: 'margin' | 'padding', side: string, value: string) => {
        setProp((props: any) => {
            if (!props.style) props.style = {}
            const key = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}`
            props.style[key] = parseInt(value) || 0
        })
    }

    return (
        <div className="space-y-4 pt-2">
            <PropertySection title="Layout" defaultOpen={true}>
                <PropertyRow label="Direction">
                    <PropertySelect
                        value={style.flexDirection || "column"}
                        options={[
                            { label: "Column", value: "column" },
                            { label: "Row", value: "row" },
                        ]}
                        onChange={(val) => handleStyleChange('flexDirection', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Alignment">
                    <PropertySelect
                        value={style.alignItems || "flex-start"}
                        options={[
                            { label: "Start", value: "flex-start" },
                            { label: "Center", value: "center" },
                            { label: "End", value: "flex-end" },
                            { label: "Stretch", value: "stretch" },
                        ]}
                        onChange={(val) => handleStyleChange('alignItems', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Justify">
                    <PropertySelect
                        value={style.justifyContent || "flex-start"}
                        options={[
                            { label: "Start", value: "flex-start" },
                            { label: "Center", value: "center" },
                            { label: "End", value: "flex-end" },
                            { label: "Space Between", value: "space-between" },
                            { label: "Space Around", value: "space-around" },
                        ]}
                        onChange={(val) => handleStyleChange('justifyContent', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Gap">
                    <PropertySlider
                        value={parseInt(style.gap) || 0}
                        min={0}
                        max={100}
                        onChange={(val) => handleStyleChange('gap', val)}
                    />
                </PropertyRow>


            </PropertySection>

            <PropertySection title="Spacing" defaultOpen={false}>
                <PropertyBoxModel
                    margin={{
                        top: style.marginTop || 0,
                        right: style.marginRight || 0,
                        bottom: style.marginBottom || 0,
                        left: style.marginLeft || 0
                    }}
                    padding={{
                        top: style.paddingTop || 0,
                        right: style.paddingRight || 0,
                        bottom: style.paddingBottom || 0,
                        left: style.paddingLeft || 0
                    }}
                    onChangeMargin={(side, value) => handleBoxModelChange('margin', side, value)}
                    onChangePadding={(side, value) => handleBoxModelChange('padding', side, value)}
                />
            </PropertySection>

            <PropertySection title="Decoration" defaultOpen={false}>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={style.backgroundColor || "transparent"}
                        onChange={(val) => handleStyleChange('backgroundColor', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Border Width">
                    <PropertySlider
                        value={style.borderWidth || 0}
                        min={0}
                        max={20}
                        onChange={(val) => handleStyleChange('borderWidth', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Border Color">
                    <PropertyColor
                        value={style.borderColor || "transparent"}
                        onChange={(val) => handleStyleChange('borderColor', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Corner Radius">
                    <PropertySlider
                        value={style.borderRadius || 0}
                        min={0}
                        max={100}
                        onChange={(val) => handleStyleChange('borderRadius', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Shadow">
                    <PropertyShadowSelect
                        value={style.boxShadow || "none"}
                        onChange={(val) => handleStyleChange('boxShadow', val)}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Position" defaultOpen={false}>
                <PropertyRow label="Type">
                    <PropertySelect
                        value={style.position || "relative"}
                        options={[
                            { label: "Relative", value: "relative" },
                            { label: "Absolute", value: "absolute" },
                            { label: "Fixed", value: "fixed" },
                            { label: "Sticky", value: "sticky" }
                        ]}
                        onChange={(val) => handleStyleChange('position', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Z-Index">
                    <PropertyInput
                        type="number"
                        value={style.zIndex || 0}
                        onChange={(val) => handleStyleChange('zIndex', parseInt(val) || 0)}
                    />
                </PropertyRow>

                {style.position === 'absolute' && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <PropertyRow label="Top">
                            <PropertyInput value={style.top || ''} onChange={(val) => handleStyleChange('top', val)} placeholder="auto" />
                        </PropertyRow>
                        <PropertyRow label="Right">
                            <PropertyInput value={style.right || ''} onChange={(val) => handleStyleChange('right', val)} placeholder="auto" />
                        </PropertyRow>
                        <PropertyRow label="Bottom">
                            <PropertyInput value={style.bottom || ''} onChange={(val) => handleStyleChange('bottom', val)} placeholder="auto" />
                        </PropertyRow>
                        <PropertyRow label="Left">
                            <PropertyInput value={style.left || ''} onChange={(val) => handleStyleChange('left', val)} placeholder="auto" />
                        </PropertyRow>
                    </div>
                )}
            </PropertySection>
        </div>
    )
}

export const Container = defineBlock<ContainerProps>({
    name: "Container",
    category: "Layout",
    icon: <div className="w-full h-full bg-gray-400 rounded-sm" />,
    description: "A flexible container for grouping elements",

    defaultProps: {
        style: defaultStyles,
        collectionId: "",
        itemId: "",
        useSlugFromUrl: false
    },

    settings: ContainerSettings,

    render: ({ children, style, className, collectionId, itemId, useSlugFromUrl, theme }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        // Fetch Collection Data
        const collectionData = useCollectionData({
            collectionId,
            itemId,
            useSlugFromUrl
        })

        // Compute Styles
        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        // Create a mutable copy of the style to allow modifications
        const finalStyle = { ...computedStyle }

        if (style?.backgroundImage) {
            const resolvedBg = resolveCollectionTemplate(style.backgroundImage, collectionData.data)
            if (resolvedBg) {
                finalStyle.backgroundImage = `url(${resolvedBg})`
            }
        }

        const isEmpty = !children || (Array.isArray(children) && children.length === 0) || (React.Children.count(children) === 0)

        // For `isApp` logic, we might need a workaround or just show generic placeholder
        // Let's use generic placeholder for now to be safe and clean.

        return (
            <CollectionItemProvider value={collectionData}>
                <div className={computedClassName} style={finalStyle}>
                    {children}
                    {enabled && React.Children.count(children) === 0 && (
                        <div
                            className="col-span-full h-full w-full flex items-center justify-center border border-dashed border-gray-300/50 bg-gray-50/20 text-xs text-gray-400 p-4"
                            style={{ gridColumn: `1 / -1` }}
                        >
                            Empty Container
                        </div>
                    )}
                </div>
            </CollectionItemProvider>
        )
    },

    childrenAllowed: true
})
