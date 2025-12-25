"use client"

import { useEditor } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertyColor,
    PropertySlider,
    PropertySpacing,
    PropertyShadowSelect,
    PropertySelect,
} from "./PropertySection"

// Font options - matching DesignPanel
const fontOptions = [
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" },
    { label: "Open Sans", value: "Open Sans" },
    { label: "Lato", value: "Lato" },
    { label: "Poppins", value: "Poppins" },
    { label: "Montserrat", value: "Montserrat" },
    { label: "Nunito Sans", value: "Nunito Sans" },
    { label: "Outfit", value: "Outfit" },
    { label: "Manrope", value: "Manrope" },
    { label: "Space Grotesk", value: "Space Grotesk" },
    { label: "Archivo", value: "Archivo" },
    { label: "Karla", value: "Karla" },
    { label: "Playfair Display", value: "Playfair Display" },
    { label: "Fraunces", value: "Fraunces" },
    { label: "Source Serif 4", value: "Source Serif 4" },
    { label: "Merriweather", value: "Merriweather" },
    { label: "Bitter", value: "Bitter" },
    { label: "Alegreya", value: "Alegreya" },
    { label: "Lora", value: "Lora" },
    { label: "Oswald", value: "Oswald" },
    { label: "IBM Plex Sans", value: "IBM Plex Sans" },
    { label: "IBM Plex Serif", value: "IBM Plex Serif" },
    { label: "Roboto Slab", value: "Roboto Slab" },
    { label: "Instrument Serif", value: "Instrument Serif" },
    { label: "Figtree", value: "Figtree" },
    { label: "JetBrains Mono", value: "JetBrains Mono" },
    { label: "Inconsolata", value: "Inconsolata" },
    { label: "Fira Code", value: "Fira Code" },
]

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
        fontFamily,
        fontSize,
        fontWeight,
    } = currentProps

    return (
        <div className="space-y-6">
            {/* Typography Section */}
            <PropertySection title="Typography" defaultOpen={false}>
                <PropertyRow label="Font Family">
                    <PropertySelect
                        value={fontFamily || "Inter"}
                        onChange={(val) => setProp((props: any) => props.fontFamily = val)}
                        options={fontOptions}
                    />
                </PropertyRow>
                {fontSize !== undefined && (
                    <PropertyRow label="Font Size">
                        <PropertySlider
                            value={fontSize || 16}
                            onChange={(val) => setProp((props: any) => props.fontSize = val)}
                            min={8}
                            max={120}
                            unit="px"
                        />
                    </PropertyRow>
                )}
            </PropertySection>

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
                    <PropertyShadowSelect
                        value={boxShadow || ""}
                        onChange={(val) => setProp((props: any) => props.boxShadow = val)}
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

