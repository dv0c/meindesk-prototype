"use client"

import { NodeProvider, useEditor } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertySelect,
    PropertySlider,
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

    // Helper for Typography (legacy logic until Typography moved to Universal)
    const hasStyleObject = currentProps.style && typeof currentProps.style === 'object'
    const getValue = (key: string) => {
        if (hasStyleObject) {
            return currentProps.style[key]
        }
        return currentProps[key]
    }
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

    return (
        <div className="space-y-6">
            {/* Typography Section (Global) */}
            <PropertySection title="Typography" defaultOpen={false}>
                <PropertyRow label="Font Family">
                    <PropertySelect
                        value={fontFamily || "Inter"}
                        onChange={(val) => updateProp('fontFamily', val)}
                        options={fontOptions}
                    />
                </PropertyRow>
                <PropertyRow label="Font Size">
                    <PropertySlider
                        value={parseInt(fontSize || 16)}
                        onChange={(val) => updateProp('fontSize', val)}
                        min={8}
                        max={120}
                        unit="px"
                    />
                </PropertyRow>
            </PropertySection>

            {/* Universal Styles (Dimensions, Layout, Spacing, Decoration, Position) */}

        </div>
    )
}

// Retaining original exports (GlobalDecorationSettings, GlobalAlignmentSettings) as simpler aliases IF NEEDED,
// but they rely on useNode() so they won't work in Sidebar.
// Actually, I should remove them to force migration and avoid confusion.
// But some components import them. I will update imports later.
// For now, I overwrite the file.

