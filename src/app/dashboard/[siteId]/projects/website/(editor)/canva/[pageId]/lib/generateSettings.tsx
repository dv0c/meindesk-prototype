// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { useNode, useEditor } from '@craftjs/core'
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
    description?: string
    type?: 'text' | 'number' | 'textarea' | 'color' | 'select' | 'checkbox' | 'media' | 'slider' | 'array' | 'richtext' | 'collection-select' | 'collection-field-select'
    placeholder?: string
    options?: { label: string; value: string | number }[]
    min?: number
    max?: number
    step?: number
    rows?: number
    unit?: string
    arrayFields?: Record<string, PropConfig>
    /** Section name for grouping - props with same section appear together in a collapsible panel */
    section?: string
    /** Whether this section should be collapsed by default (only applies to first prop in a section) */
    defaultCollapsed?: boolean
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
        const { actions, selectedId, nodeProps, nodes } = useEditor((state) => {
            const [currentId] = state.events.selected
            return {
                selectedId: currentId,
                nodeProps: currentId ? state.nodes[currentId].data.props : null,
                nodes: state.nodes, // Expose nodes for traversal
                actions: state.actions
            }
        })

        const props = (nodeProps || {}) as P

        const setProp = (cb: (props: P) => void) => {
            if (selectedId) {
                actions.setProp(selectedId, cb)
            }
        }

        const params = useParams()
        const siteId = params?.siteId as string
        const [isDialogOpen, setIsDialogOpen] = useState(false)
        const [currentMediaProp, setCurrentMediaProp] = useState<string>('')
        const [collections, setCollections] = useState<{ id: string; name: string; fields: any }[]>([])
        const [collectionsLoading, setCollectionsLoading] = useState(false)

        // Load collections for collection-select fields
        React.useEffect(() => {
            const hasCollectionSelect = Object.values(config).some(c =>
                typeof c === 'object' && (c.type === 'collection-select' || c.type === 'collection-field-select')
            )
            if (hasCollectionSelect && siteId && collections.length === 0) {
                setCollectionsLoading(true)
                fetch(`/api/dashboard/${siteId}/collections`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.collections) {
                            setCollections(data.collections)
                        }
                    })
                    .catch(console.error)
                    .finally(() => setCollectionsLoading(false))
            }
        }, [siteId])

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

        if (!selectedId || !nodeProps) return null

        // Group props by section
        const sections = new Map<string, { propName: string; propConfig: PropConfig | string; defaultCollapsed?: boolean }[]>()

        Object.entries(config).forEach(([propName, propConfig]) => {
            const normalized = typeof propConfig === 'string' ? { label: propConfig } : propConfig
            const sectionName = normalized.section || sectionTitle

            if (!sections.has(sectionName)) {
                sections.set(sectionName, [])
            }
            sections.get(sectionName)!.push({
                propName,
                propConfig,
                defaultCollapsed: normalized.defaultCollapsed
            })
        })

        // Helper to find parent with collectionId
        const findParentCollectionId = (nodeId: string): string | undefined => {
            let currentId = nodeId
            // Limit depth to avoid infinite loops (though strictly explicit parent refs prevent loops)
            let depth = 0
            while (currentId && currentId !== 'ROOT' && depth < 50) {
                const node = nodes[currentId]
                if (!node) {
                    break
                }

                // Check if this node has a collectionId prop
                // Note: CollectionItem passing dynamic ID via helper might be an issue if we need raw UUID
                // But usually collectionId prop is what we want
                if (node.data.props.collectionId && typeof node.data.props.collectionId === 'string' && node.data.props.collectionId.length > 10) {
                    return node.data.props.collectionId
                }

                if (!node.data.parent) {
                    break
                }
                currentId = node.data.parent
                depth++
            }
            return undefined
        }

        // Helper to render a single prop control
        const renderPropControl = (propName: string, propConfig: PropConfig | string) => {
            const defaultValue = defaultProps?.[propName]
            const normalized = normalizeConfig(propName, propConfig, defaultValue !== undefined ? defaultValue : props[propName])
            const value = props[propName]

            // Rich Text
            if (normalized.type === 'richtext') {
                return (
                    <PropertyRichText
                        key={propName}
                        label={normalized.label}
                        description={normalized.description}
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
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description}>
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
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description}>
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
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description}>
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
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description}>
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
                        description={normalized.description}
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
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description}>
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
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description}>
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

            // Collection select dropdown
            if (normalized.type === 'collection-select') {
                return (
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description}>
                        <PropertySelect
                            value={value || ''}
                            onChange={(v) => setProp((p: P) => {
                                p[propName] = v
                            })}
                            options={
                                collectionsLoading
                                    ? [{ label: 'Loading...', value: '' }]
                                    : collections.length > 0
                                        ? [{ label: 'Select a collection...', value: '' }, ...collections.map(c => ({ label: c.name, value: c.id }))]
                                        : [{ label: 'No collections found', value: '' }]
                            }
                        />
                    </PropertyRow>
                )
            }

            // Field Select that auto-detects parent collection
            if (normalized.type === 'collection-field-select') {
                // 1. Traverse up to find parent with collectionId
                const parentCollectionId = findParentCollectionId(selectedId)

                // 2. Find collection fields
                let fieldOptions: { label: string; value: string }[] = []
                let placeholderText = "Select found collection..."

                if (!parentCollectionId) {
                    placeholderText = "No parent collection found"
                } else if (!collectionsLoading) {
                    const collection = collections.find(c => c.id === parentCollectionId)
                    if (collection && collection.fields) {
                        try {
                            // Fields might be string (if prisma Json type is returned as string?) or object
                            // Based on API response for Json, it should be object if parsed correctly by prisma client
                            // But usually prisma returns Json object as object.
                            // If `fields` was created with JSON.stringify, it might be a string containing JSON.
                            // Let's handle both.
                            let fields = collection.fields
                            if (typeof fields === 'string') {
                                fields = JSON.parse(fields)
                            }

                            if (Array.isArray(fields)) {
                                fieldOptions = fields.map((f: any) => ({
                                    label: f.label || f.name,
                                    value: f.name
                                }))
                            }
                        } catch (e) {
                            console.error("Error parsing collection fields:", e)
                        }
                    } else {
                        // Maybe collection not loaded or not found
                        placeholderText = "Collection not found"
                    }
                } else {
                    placeholderText = "Loading collections..."
                }

                // Always add 'No Field' option? Or allow empty

                return (
                    <PropertyRow key={propName} label={normalized.label} description={normalized.description || "Auto-detected from parent collection"}>
                        <PropertySelect
                            value={value || ''}
                            onChange={(v) => setProp((p: P) => {
                                p[propName] = v
                            })}
                            options={
                                fieldOptions.length > 0
                                    ? [{ label: 'Select a field...', value: '' }, ...fieldOptions]
                                    : [{ label: placeholderText, value: '' }]
                            }
                            disabled={fieldOptions.length === 0}
                        />
                    </PropertyRow>
                )
            }

            return null
        }

        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    {Array.from(sections.entries()).map(([sectionName, sectionProps], index) => {
                        // Generate summary for this section
                        const sectionSummary = sectionProps
                            .slice(0, 2)
                            .map(({ propName, propConfig }) => {
                                const normalized = normalizeConfig(propName, propConfig, defaultProps?.[propName])
                                const value = props[propName]
                                if (value && normalized.type !== 'media' && normalized.type !== 'array' && normalized.type !== 'collection-select' && normalized.type !== 'collection-field-select') {
                                    if (typeof value === 'string' && value.length > 15) {
                                        return `${value.substring(0, 15)}...`
                                    }
                                    return String(value)
                                }
                                if (normalized.type === 'array' && Array.isArray(value)) {
                                    return `${value.length} items`
                                }
                                return null
                            })
                            .filter(Boolean)
                            .join(', ')

                        // Check if section should be collapsed by default
                        const firstPropCollapsed = sectionProps[0]?.defaultCollapsed

                        return (
                            <PropertySection
                                key={sectionName}
                                title={sectionName}
                                summary={sectionSummary}
                                defaultOpen={firstPropCollapsed !== true}
                            >
                                {sectionProps.map(({ propName, propConfig }) =>
                                    renderPropControl(propName, propConfig)
                                )}
                            </PropertySection>
                        )
                    })}
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
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{value.length} items</span>
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
                className="w-full py-2.5 px-3 bg-muted/50 border border-dashed border-border text-muted-foreground rounded-md text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-muted hover:text-foreground hover:border-solid transition-all"
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
            className={`border rounded-md overflow-hidden mb-2 bg-background ${isOpen ? 'ring-2 ring-ring ring-offset-1 border-transparent' : 'border-border hover:border-muted-foreground/30'} transition-all`}
        >
            <div
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors ${isOpen ? 'bg-muted/30' : ''}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <div
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                        <GripVertical size={14} />
                    </div>

                    <span className="text-sm font-medium truncate">
                        {previewLabel}
                    </span>
                    {/* Show nested array count if available */}
                    {Object.entries(arrayFields).map(([key, config]) => {
                        if (config.type === 'array' && Array.isArray(item[key])) {
                            return (
                                <span key={key} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto mr-2">
                                    {item[key].length}
                                </span>
                            )
                        }
                        return null
                    })}
                </div>
                {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>

            {isOpen && (
                <div className="px-4 pb-4 pt-3 space-y-3 border-t bg-muted/5">
                    {Object.entries(arrayFields).map(([fieldKey, fieldConfig]) => {
                        // Nested Array (Recursive)
                        if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
                            return (
                                <div key={fieldKey} className="pt-3 mt-2 border-t">
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
                            <div key={fieldKey} className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    {fieldConfig.label || fieldKey}
                                </label>
                                {/* Simple text input for string fields */}
                                {(!fieldConfig.type || fieldConfig.type === 'text') && (
                                    <input
                                        value={item[fieldKey] || ''}
                                        onChange={(e) => onChange(fieldKey, e.target.value)}
                                        className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                        placeholder={fieldConfig.placeholder}
                                    />
                                )}
                                {/* Add more field types here if needed (e.g. number, select) - keeping it simple for now */}
                                {fieldConfig.type === 'number' && (
                                    <input
                                        type="number"
                                        value={item[fieldKey] || ''}
                                        onChange={(e) => onChange(fieldKey, Number(e.target.value))}
                                        className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                    />
                                )}
                            </div>
                        )
                    })}

                    <div className="flex justify-end items-center pt-3 mt-3 border-t">
                        <button
                            onClick={onRemove}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
