"use client"

import { useEditor } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertyColor,
    PropertySlider,
    PropertySpacing,
} from "./PropertySection"

export const GlobalStylesPanel = () => {
    const { id, currentProps, actions } = useEditor((state) => {
        const [selectedId] = state.events.selected
        if (!selectedId) return { id: null, currentProps: null }

        return {
            id: selectedId,
            currentProps: state.nodes[selectedId].data.props
        }
    })

    if (!id || !currentProps) return null

    const setProp = (cb: (props: any) => void) => {
        actions.setProp(id, cb)
    }

    const {
        marginTop, marginRight, marginBottom, marginLeft,
        paddingTop, paddingRight, paddingBottom, paddingLeft,
        backgroundColor,
        borderRadius,
        borderWidth,
        borderColor,
        boxShadow,
    } = currentProps

    return (
        <div className="space-y-6">
            <PropertySection title="Spacing & Alignment" defaultOpen={true}>
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

            <PropertySection title="Decoration" defaultOpen={true}>
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
        </div>
    )
}

// Retaining original exports (GlobalDecorationSettings, GlobalAlignmentSettings) as simpler aliases IF NEEDED,
// but they rely on useNode() so they won't work in Sidebar.
// Actually, I should remove them to force migration and avoid confusion.
// But some components import them. I will update imports later.
// For now, I overwrite the file.

