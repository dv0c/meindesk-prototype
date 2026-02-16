"use client"

import { NodeProvider, useEditor } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertySelect,
    PropertySlider,
    PropertyToggle,
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

export const GlobalStylesPanel = ({ exclude = [] }: { exclude?: string[] }) => {
    const { id, currentProps, actions } = useEditor((state) => {
        const [selectedId] = state.events.selected
        if (!selectedId) return { id: null, currentProps: null }

        return {
            id: selectedId,
            currentProps: state.nodes[selectedId].data.props
        }
    })

    if (!id || !currentProps) return null

    const styleContainerKey = currentProps.style && typeof currentProps.style === 'object'
        ? 'style'
        : (currentProps.blockStyle && typeof currentProps.blockStyle === 'object' ? 'blockStyle' : null)

    // Helper for Typography (legacy logic until Typography moved to Universal)
    const getValue = (key: string) => {
        if (styleContainerKey) {
            return currentProps[styleContainerKey]?.[key]
        }
        return currentProps[key]
    }
    const updateProp = (key: string, value: any) => {
        actions.setProp(id, (props: any) => {
            if (styleContainerKey) {
                if (!props[styleContainerKey]) props[styleContainerKey] = {}
                props[styleContainerKey][key] = value
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
            {!exclude.includes('typography') && (
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
            )}

            {/* Universal Styles (Dimensions, Layout, Spacing, Decoration, Position) */}

            {/* Responsive Settings */}
            <PropertySection title="Responsive" defaultOpen={false}>
                <PropertyRow label="Visibility">
                    <div className="flex flex-col gap-2 pt-2">
                        <PropertyToggle
                            label="Hide on Desktop"
                            value={currentProps.responsive?.hiddenOn?.includes('desktop') || false}
                            onChange={(checked) => {
                                actions.setProp(id, (props: any) => {
                                    if (!props.responsive) props.responsive = { hiddenOn: [] }
                                    if (!props.responsive.hiddenOn) props.responsive.hiddenOn = []

                                    if (checked) {
                                        if (!props.responsive.hiddenOn.includes('desktop')) {
                                            props.responsive.hiddenOn.push('desktop')
                                        }
                                    } else {
                                        props.responsive.hiddenOn = props.responsive.hiddenOn.filter((b: string) => b !== 'desktop')
                                    }
                                })
                            }}
                        />
                        <PropertyToggle
                            label="Hide on Tablet"
                            value={currentProps.responsive?.hiddenOn?.includes('tablet') || false}
                            onChange={(checked) => {
                                actions.setProp(id, (props: any) => {
                                    if (!props.responsive) props.responsive = { hiddenOn: [] }
                                    if (!props.responsive.hiddenOn) props.responsive.hiddenOn = []

                                    if (checked) {
                                        if (!props.responsive.hiddenOn.includes('tablet')) {
                                            props.responsive.hiddenOn.push('tablet')
                                        }
                                    } else {
                                        props.responsive.hiddenOn = props.responsive.hiddenOn.filter((b: string) => b !== 'tablet')
                                    }
                                })
                            }}
                        />
                        <PropertyToggle
                            label="Hide on Mobile"
                            value={currentProps.responsive?.hiddenOn?.includes('mobile') || false}
                            onChange={(checked) => {
                                actions.setProp(id, (props: any) => {
                                    if (!props.responsive) props.responsive = { hiddenOn: [] }
                                    if (!props.responsive.hiddenOn) props.responsive.hiddenOn = []

                                    if (checked) {
                                        if (!props.responsive.hiddenOn.includes('mobile')) {
                                            props.responsive.hiddenOn.push('mobile')
                                        }
                                    } else {
                                        props.responsive.hiddenOn = props.responsive.hiddenOn.filter((b: string) => b !== 'mobile')
                                    }
                                })
                            }}
                        />
                    </div>
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
