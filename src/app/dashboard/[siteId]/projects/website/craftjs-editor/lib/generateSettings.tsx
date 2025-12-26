// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { useNode } from '@craftjs/core'
import { useParams } from 'next/navigation'
import { PropertySection, PropertyRow, PropertyInput, PropertySlider, PropertySelect, PropertyColor, PropertyCheckbox, PropertyRichText, PropertySpacing, PropertyShadowSelect } from '../components/PropertySection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Box, Palette, WholeWord } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageIcon } from 'lucide-react'
import MediaLibraryDialog, { MediaItem } from '@/components/MediaGallery/media-select'
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

/**
 * Configuration for a single prop's settings control
 */
export interface PropConfig {
    label: string
    type?: 'text' | 'number' | 'textarea' | 'color' | 'select' | 'checkbox' | 'media' | 'slider' | 'array' | 'richtext'
    placeholder?: string
    options?: { label: string; value: string | number }[]
    min?: number
    max?: number
    step?: number
    rows?: number
    unit?: string
    arrayFields?: Record<string, PropConfig>
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
    sectionTitle: string = 'Content',
    defaultProps?: Partial<P>
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
            const defaultValue = defaultProps?.[propName]
            const normalized = normalizeConfig(propName, propConfig, defaultValue !== undefined ? defaultValue : props[propName])
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
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto space-y-4">
                    <PropertySection title={sectionTitle} summary={summary}>
                        {Object.entries(config).map(([propName, propConfig]) => {
                            const defaultValue = defaultProps?.[propName]
                            const normalized = normalizeConfig(propName, propConfig, defaultValue !== undefined ? defaultValue : props[propName])
                            const value = props[propName]

                            // Rich Text
                            if (normalized.type === 'richtext') {
                                return (
                                    <PropertyRichText
                                        key={propName}
                                        label={normalized.label}
                                        value={value || ''}
                                        onChange={(v) => setProp((p: P) => {
                                            p[propName] = v
                                        })}
                                    />
                                )
                            }

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

                            // Array of objects (Sortable List)
                            if (normalized.type === 'array' && normalized.arrayFields) {
                                return (
                                    <ArrayEditor
                                        key={propName}
                                        propName={propName}
                                        label={normalized.label}
                                        value={value as any[]}
                                        arrayFields={normalized.arrayFields}
                                        onChange={(newValue) => setProp((p: P) => {
                                            p[propName] = newValue
                                        })}
                                    />
                                )
                            }

                            return null
                        })}
                    </PropertySection>
                </div>
                {/* Dialogs outside to avoid clipping */}
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

// ----------------------------------------------------------------------
// Helper Components for Array Editor (dnd-kit)
// ----------------------------------------------------------------------

interface ArrayEditorProps {
    propName: string
    label: string
    value: any[]
    arrayFields: Record<string, PropConfig>
    onChange: (newValue: any[]) => void
}

// function declaration for hoisting to support recursion
function ArrayEditor({ propName, label, value = [], arrayFields, onChange }: ArrayEditorProps) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            // Find index by ID or fallback to array index
            // We use simple index logic here for robustness with this generic editor
            const oldIdx = value.findIndex(item => (item.id || `temp-${value.indexOf(item)}`) === active.id)
            const newIdx = value.findIndex(item => (item.id || `temp-${value.indexOf(item)}`) === over.id)

            if (oldIdx !== -1 && newIdx !== -1) {
                onChange(arrayMove(value, oldIdx, newIdx))
            }
        }
    }

    const addItem = () => {
        // Create a new item with empty values for fields
        const newItem: any = { id: `${propName}-${Date.now()}` }
        onChange([...value, newItem])
        setOpenIndex(value.length)
    }

    const removeItem = (index: number) => {
        const newValue = [...value]
        newValue.splice(index, 1)
        onChange(newValue)
        setOpenIndex(null)
    }

    const updateItem = (index: number, field: string, val: any) => {
        const newValue = [...value]
        newValue[index] = { ...newValue[index], [field]: val }
        onChange(newValue)
    }

    return (
        <div className="space-y-3 border rounded-md p-3 bg-muted/30">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground">{value.length} items</span>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={value.map(item => item.id || `temp-${value.indexOf(item)}`)} // Prefer ID
                    strategy={verticalListSortingStrategy}
                >
                    {value.map((item, index) => (
                        <SortableArrayItem
                            key={item.id || index}
                            id={item.id || `temp-${index}`}
                            item={item}
                            index={index}
                            arrayFields={arrayFields}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                            onChange={(field, val) => updateItem(index, field, val)}
                            onRemove={() => removeItem(index)}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <button
                onClick={addItem}
                className="w-full py-2 px-3 bg-secondary text-secondary-foreground rounded-md text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-secondary/80 transition-colors"
            >
                <Plus size={14} />
                Add Item
            </button>
        </div>
    )
}

interface SortableArrayItemProps {
    id: string
    item: any
    index: number
    arrayFields: Record<string, PropConfig>
    isOpen: boolean
    onToggle: () => void
    onChange: (field: string, value: any) => void
    onRemove: () => void
}

function SortableArrayItem({ id, item, index, arrayFields, isOpen, onToggle, onChange, onRemove }: SortableArrayItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto",
        position: 'relative' as 'relative',
    }

    // Try to find a good label for the header
    const previewLabel = item.label || item.title || item.name || `Item ${index + 1}`

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`border rounded-md overflow-hidden mb-2 bg-background ${isOpen ? 'ring-1 ring-ring border-transparent' : 'border-border'}`}
        >
            <div
                className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors ${isOpen ? 'bg-muted/30' : ''}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <div
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                    >
                        <GripVertical size={14} />
                    </div>

                    <span className="text-xs font-medium truncate">
                        {previewLabel}
                    </span>
                    {/* Show nested array count if available */}
                    {Object.entries(arrayFields).map(([key, config]) => {
                        if (config.type === 'array' && Array.isArray(item[key])) {
                            return (
                                <span key={key} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto mr-2">
                                    {item[key].length}
                                </span>
                            )
                        }
                        return null
                    })}
                </div>
                {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
            </div>

            {isOpen && (
                <div className="p-3 space-y-3 border-t bg-muted/10">
                    {Object.entries(arrayFields).map(([fieldKey, fieldConfig]) => {
                        // Nested Array (Recursive)
                        if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
                            return (
                                <div key={fieldKey} className="mt-2 border-t pt-2">
                                    <label className="text-[10px] uppercase text-muted-foreground font-medium mb-1 block">
                                        {fieldConfig.label || fieldKey}
                                    </label>
                                    <ArrayEditor
                                        propName={fieldKey}
                                        label={fieldConfig.label}
                                        value={item[fieldKey] as any[] || []}
                                        arrayFields={fieldConfig.arrayFields}
                                        onChange={(newValue) => onChange(fieldKey, newValue)}
                                    />
                                </div>
                            )
                        }

                        return (
                            <div key={fieldKey} className="space-y-1">
                                <label className="text-[10px] uppercase text-muted-foreground font-medium">
                                    {fieldConfig.label || fieldKey}
                                </label>
                                {/* Simple text input for string fields */}
                                {(!fieldConfig.type || fieldConfig.type === 'text') && (
                                    <input
                                        value={item[fieldKey] || ''}
                                        onChange={(e) => onChange(fieldKey, e.target.value)}
                                        className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                        placeholder={fieldConfig.placeholder}
                                    />
                                )}
                                {/* Add more field types here if needed (e.g. number, select) - keeping it simple for now */}
                                {fieldConfig.type === 'number' && (
                                    <input
                                        type="number"
                                        value={item[fieldKey] || ''}
                                        onChange={(e) => onChange(fieldKey, Number(e.target.value))}
                                        className="w-full h-8 px-2 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                )}
                            </div>
                        )
                    })}

                    <div className="flex justify-between items-center pt-2 mt-2 border-t">
                        <span className="text-[10px] text-muted-foreground">ID: {id.split('-').pop()?.substring(0, 6)}</span>
                        <button
                            onClick={onRemove}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                            <Trash2 size={12} />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
