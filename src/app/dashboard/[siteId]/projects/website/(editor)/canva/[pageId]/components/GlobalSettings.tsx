"use client"

import { useEditor } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertyColor,
    PropertySlider,
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

    // Helper to determine if we should update 'style' object or root props
    const hasStyleObject = currentProps.style && typeof currentProps.style === 'object'

    const setProp = (cb: (props: any) => void) => {
        actions.setProp(id, (props: any) => {
            if (hasStyleObject) {
                // If using defineBlock pattern (props.style), ensure we pass a proxy or handle logic
                // But simpler: just intercept the callback logic if possible, or expect the cb to handle it?
                // The callbacks below (e.g., props.fontFamily = val) assume root level.
                // We need to intercept.

                // Workaround: We wrapper the callback
                const styleProxy = new Proxy(props.style || {}, {
                    set: (target, key, value) => {
                        target[key] = value
                        return true
                    },
                    get: (target, key) => target[key]
                })

                // We try to let the original cb run on a mock object to catch what it wants to set?
                // No, that's complex.
                // Better: Rewrite the handlers below to use a smart setter.
            }
            cb(props)
        })
    }

    // Helper to get value from style object or root
    const getValue = (key: string) => {
        if (hasStyleObject) {
            return currentProps.style[key]
        }
        return currentProps[key]
    }

    // Helper to set value to style object or root
    const updateProp = (key: string, value: any) => {
        actions.setProp(id, (props: any) => {
            if (hasStyleObject) {
                if (!props.style) props.style = {}
                props.style[key] = value
            } else {
                props[key] = value
            }
        })
    }

    const fontFamily = getValue('fontFamily')
    const fontSize = getValue('fontSize')
    const backgroundColor = getValue('backgroundColor')
    const borderWidth = getValue('borderWidth')
    const borderRadius = getValue('borderRadius')
    const borderColor = getValue('borderColor')
    const boxShadow = getValue('boxShadow')


    return (
        <div className="space-y-6">
            {/* Typography Section */}
            <PropertySection title="Typography" defaultOpen={false}>
                <PropertyRow label="Font Family">
                    <PropertySelect
                        value={fontFamily || "Inter"}
                        onChange={(val) => updateProp('fontFamily', val)}
                        options={fontOptions}
                    />
                </PropertyRow>
                <PropertyRow label="Font Size">
                    {/* Size might need unit handling if defineBlock uses strings '16px' vs numbers */}
                    <PropertySlider
                        value={parseInt(fontSize || 16)}
                        onChange={(val) => updateProp('fontSize', val)}
                        min={8}
                        max={120}
                        unit="px"
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Decoration" defaultOpen={true}>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={backgroundColor}
                        onChange={(color) => updateProp('backgroundColor', color)}
                    />
                </PropertyRow>
                <PropertyRow label="Border">
                    <div className="space-y-3 pt-1">
                        <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-muted-foreground w-12 shrink-0">Width</span>
                            <div className="flex-1">
                                <PropertySlider
                                    value={parseInt(borderWidth || 0)}
                                    onChange={(val) => updateProp('borderWidth', val)}
                                    max={20}
                                    unit="px"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-muted-foreground w-12 shrink-0">Radius</span>
                            <div className="flex-1">
                                <PropertySlider
                                    value={parseInt(borderRadius || 0)}
                                    onChange={(val) => updateProp('borderRadius', val)}
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
                                    onChange={(color) => updateProp('borderColor', color)}
                                />
                            </div>
                        </div>
                    </div>
                </PropertyRow>
                <PropertyRow label="Shadow">
                    <PropertyShadowSelect
                        value={boxShadow || ""}
                        onChange={(val) => updateProp('boxShadow', val)}
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

