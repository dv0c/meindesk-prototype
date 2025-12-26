// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { useNode } from '@craftjs/core'
import { useParams } from 'next/navigation'
import { PropertySection, PropertyRow, PropertyInput, PropertySlider, PropertySelect, PropertyColor, PropertyCheckbox } from '../components/PropertySection'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageIcon } from 'lucide-react'
import MediaLibraryDialog, { MediaItem } from '@/components/MediaGallery/media-select'

/**
 * Configuration for a single prop's settings control
 */
export interface PropConfig {
    label: string
    type?: 'text' | 'number' | 'textarea' | 'color' | 'select' | 'checkbox' | 'media' | 'slider'
    placeholder?: string
    options?: { label: string; value: string | number }[]
    min?: number
    max?: number
    step?: number
    rows?: number
    unit?: string
}

/**
 * Settings configuration object
 * Key = prop name, Value = config or just label string
 */
export interface SettingsConfig {
    [propName: string]: PropConfig | string
}

/**
 * Auto-detect control type based on prop name and value
 */
function detectControlType(propName: string, value: any): PropConfig['type'] {
    // Color detection
    if (propName.toLowerCase().includes('color')) return 'color'

    // Media detection  
    if (propName.toLowerCase().includes('image') ||
        propName.toLowerCase().includes('url') ||
        propName.toLowerCase().includes('src')) return 'media'

    // Type-based detection
    if (typeof value === 'boolean') return 'checkbox'
    if (typeof value === 'number') return 'slider'
    if (typeof value === 'string' && value.length > 50) return 'textarea'

    return 'text'
}

/**
 * Normalize config - convert string labels to full PropConfig
 */
function normalizeConfig(propName: string, config: PropConfig | string, defaultValue: any): PropConfig {
    if (typeof config === 'string') {
        return {
            label: config,
            type: detectControlType(propName, defaultValue)
        }
    }

    return {
        ...config,
        type: config.type || detectControlType(propName, defaultValue)
    }
}

/**
 * Generate settings component from configuration
 */
export function generateSettings<P extends Record<string, any>>(
    config: SettingsConfig,
    sectionTitle: string = 'Content'
) {
    const GeneratedSettings = () => {
        const { actions: { setProp }, props } = useNode((node) => ({
            props: node.data.props as P
        }))

        const params = useParams()
        const siteId = params?.siteId as string
        const [isDialogOpen, setIsDialogOpen] = useState(false)
        const [currentMediaProp, setCurrentMediaProp] = useState<string>('')

        const handleMediaSelect = (items: MediaItem[]) => {
            if (items.length > 0 && currentMediaProp) {
                setProp((p: P) => {
                    p[currentMediaProp] = items[0].url
                })
            }
        }

        const openMediaDialog = (propName: string) => {
            setCurrentMediaProp(propName)
            setIsDialogOpen(true)
        }

        // Generate summary
        const summaryParts: string[] = []
        Object.entries(config).forEach(([propName, propConfig]) => {
            const normalized = normalizeConfig(propName, propConfig, props[propName])
            const value = props[propName]

            if (value && normalized.type !== 'media') {
                if (typeof value === 'string' && value.length > 20) {
                    summaryParts.push(`${value.substring(0, 20)}...`)
                } else {
                    summaryParts.push(String(value))
                }
            } else if (value && normalized.type === 'media') {
                summaryParts.push('Has image')
            }
        })
        const summary = summaryParts.slice(0, 2).join(', ')

        return (
            <div>
                <PropertySection title={sectionTitle} summary={summary}>
                    {Object.entries(config).map(([propName, propConfig]) => {
                        const normalized = normalizeConfig(propName, propConfig, props[propName])
                        const value = props[propName]

                        // Text input
                        if (normalized.type === 'text' || normalized.type === 'number') {
                            return (
                                <PropertyRow key={propName} label={normalized.label}>
                                    <PropertyInput
                                        type={normalized.type}
                                        value={value || ''}
                                        onChange={(v) => setProp((p: P) => {
                                            p[propName] = normalized.type === 'number' ? Number(v) : v
                                        })}
                                        placeholder={normalized.placeholder}
                                        min={normalized.min}
                                        max={normalized.max}
                                        step={normalized.step}
                                    />
                                </PropertyRow>
                            )
                        }

                        // Textarea
                        if (normalized.type === 'textarea') {
                            return (
                                <PropertyRow key={propName} label={normalized.label}>
                                    <Textarea
                                        value={value || ''}
                                        onChange={(e) => setProp((p: P) => {
                                            p[propName] = e.target.value
                                        })}
                                        placeholder={normalized.placeholder}
                                        rows={normalized.rows || 3}
                                        className="text-xs"
                                    />
                                </PropertyRow>
                            )
                        }

                        // Color picker
                        if (normalized.type === 'color') {
                            return (
                                <PropertyRow key={propName} label={normalized.label}>
                                    <PropertyColor
                                        value={value || ''}
                                        onChange={(v) => setProp((p: P) => {
                                            p[propName] = v
                                        })}
                                        placeholder={normalized.placeholder}
                                    />
                                </PropertyRow>
                            )
                        }

                        // Select dropdown
                        if (normalized.type === 'select' && normalized.options) {
                            return (
                                <PropertyRow key={propName} label={normalized.label}>
                                    <PropertySelect
                                        value={String(value || normalized.options[0]?.value || '')}
                                        onChange={(v) => setProp((p: P) => {
                                            p[propName] = v
                                        })}
                                        options={normalized.options.map(opt => ({
                                            label: opt.label,
                                            value: String(opt.value)
                                        }))}
                                    />
                                </PropertyRow>
                            )
                        }

                        // Checkbox
                        if (normalized.type === 'checkbox') {
                            return (
                                <PropertyCheckbox
                                    key={propName}
                                    id={propName}
                                    label={normalized.label}
                                    checked={Boolean(value)}
                                    onChange={(v) => setProp((p: P) => {
                                        p[propName] = v
                                    })}
                                />
                            )
                        }

                        // Slider
                        if (normalized.type === 'slider') {
                            return (
                                <PropertyRow key={propName} label={normalized.label}>
                                    <PropertySlider
                                        value={Number(value) || 0}
                                        onChange={(v) => setProp((p: P) => {
                                            p[propName] = v
                                        })}
                                        min={normalized.min}
                                        max={normalized.max}
                                        step={normalized.step}
                                        unit={normalized.unit}
                                    />
                                </PropertyRow>
                            )
                        }

                        // Media selector
                        if (normalized.type === 'media') {
                            return (
                                <PropertyRow key={propName} label={normalized.label}>
                                    <div className="flex flex-col gap-2 w-full">
                                        {value ? (
                                            <div className="relative group w-full aspect-video bg-muted rounded-md overflow-hidden border border-border">
                                                <img
                                                    src={value}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => openMediaDialog(propName)}
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
                                                onClick={() => openMediaDialog(propName)}
                                            >
                                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                                <span className="text-muted-foreground">Select Image</span>
                                            </Button>
                                        )}
                                    </div>
                                </PropertyRow>
                            )
                        }

                        return null
                    })}
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

    GeneratedSettings.displayName = `GeneratedSettings_${sectionTitle}`
    return GeneratedSettings
}
