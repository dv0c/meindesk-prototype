"use client"

import { useNode } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertyColor,
    PropertySlider,
    PropertySpacing,
} from "./PropertySection"

export const GlobalDecorationSettings = () => {
    const {
        actions: { setProp },
        backgroundColor,
        borderRadius,
        borderWidth,
        borderColor,
        boxShadow,
    } = useNode((node) => ({
        backgroundColor: node.data.props.backgroundColor,
        borderRadius: node.data.props.borderRadius,
        borderWidth: node.data.props.borderWidth,
        borderColor: node.data.props.borderColor,
        boxShadow: node.data.props.boxShadow,
    }))

    return (
        <PropertySection title="Decoration">
            <PropertyRow label="Background">
                <PropertyColor
                    value={backgroundColor}
                    onChange={(color) => setProp((props: any) => props.backgroundColor = color)}
                />
            </PropertyRow>
            <PropertyRow label="Border">
                <div className="space-y-3 pt-1">
                    <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-muted-foreground w-12 shrink-0">Width</span>
                        <div className="flex-1">
                            <PropertySlider
                                value={borderWidth || 0}
                                onChange={(val) => setProp((props: any) => props.borderWidth = val)}
                                max={20}
                                unit="px"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-muted-foreground w-12 shrink-0">Radius</span>
                        <div className="flex-1">
                            <PropertySlider
                                value={borderRadius || 0}
                                onChange={(val) => setProp((props: any) => props.borderRadius = val)}
                                max={50}
                                unit="px"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-muted-foreground w-12 shrink-0">Color</span>
                        <div className="flex-1">
                            <PropertyColor
                                value={borderColor}
                                onChange={(color) => setProp((props: any) => props.borderColor = color)}
                            />
                        </div>
                    </div>
                </div>
            </PropertyRow>
            <PropertyRow label="Shadow">
                <input
                    className="w-full h-8 px-2 text-xs border rounded-md"
                    value={boxShadow || ""}
                    onChange={(e) => setProp((props: any) => props.boxShadow = e.target.value)}
                    placeholder="e.g. 0 4px 6px rgba(0,0,0,0.1)"
                />
            </PropertyRow>
        </PropertySection>
    )
}

export const GlobalAlignmentSettings = () => {
    const {
        actions: { setProp },
        marginTop, marginRight, marginBottom, marginLeft,
        paddingTop, paddingRight, paddingBottom, paddingLeft,
    } = useNode((node) => ({
        marginTop: node.data.props.marginTop,
        marginRight: node.data.props.marginRight,
        marginBottom: node.data.props.marginBottom,
        marginLeft: node.data.props.marginLeft,
        paddingTop: node.data.props.paddingTop,
        paddingRight: node.data.props.paddingRight,
        paddingBottom: node.data.props.paddingBottom,
        paddingLeft: node.data.props.paddingLeft,
    }))

    return (
        <PropertySection title="Spacing & Alignment">
            <PropertyRow label="Margin (px/auto)">
                <PropertySpacing
                    values={{ top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft }}
                    onChange={(side, val) => setProp((props: any) => props[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`] = val)}
                />
            </PropertyRow>
            <PropertyRow label="Padding (px)">
                <PropertySpacing
                    values={{ top: paddingTop, right: paddingRight, bottom: paddingBottom, left: paddingLeft }}
                    onChange={(side, val) => setProp((props: any) => props[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] = val)}
                />
            </PropertyRow>
        </PropertySection>
    )
}
