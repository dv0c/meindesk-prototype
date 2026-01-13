"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { createCollection, getCollections, updateCollection } from "@/lib/actions/collection-actions"
import {
    ArrowLeft,
    Calendar,
    Database,
    FileText,
    Hash,
    Image as ImageIcon,
    List,
    Loader2,
    Plus,
    ToggleLeft,
    Type,
    X
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CMSCreateCollectionProps {
    siteId: string
    onBack: () => void
    onSuccess: () => void
    initialData?: any // For edit mode
}

const FIELD_TYPES = [
    { type: "text", label: "Text", icon: Type },
    { type: "richtext", label: "Rich Text", icon: FileText },
    { type: "number", label: "Number", icon: Hash },
    { type: "image", label: "Image", icon: ImageIcon },
    { type: "boolean", label: "Switch", icon: ToggleLeft },
    { type: "date", label: "Date/Time", icon: Calendar },
    { type: "select", label: "Option", icon: List },
    { type: "relation", label: "Reference", icon: Database },
]

export function CMSCreateCollection({ siteId, onBack, onSuccess, initialData }: CMSCreateCollectionProps) {
    const [name, setName] = useState(initialData?.name || "")
    const [slug, setSlug] = useState(initialData?.slug || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [fields, setFields] = useState<any[]>(initialData?.fields || [
        { name: "title", type: "text", label: "Title", required: true, id: "default_title" }
    ])
    const [loading, setLoading] = useState(false)
    const [newFieldPopoverOpen, setNewFieldPopoverOpen] = useState(false)
    const [availableCollections, setAvailableCollections] = useState<any[]>([])
    // Temporary state for the new option input being typed for each field
    // Map of field index -> string value
    const [optionInputs, setOptionInputs] = useState<Record<number, string>>({})

    // Fetch available collections for relations
    useEffect(() => {
        const fetchCollections = async () => {
            const res = await getCollections(siteId)
            if (res.collections) {
                // Filter out the current collection if editing to prevent self-reference loops mostly (optional)
                setAvailableCollections(res.collections)
            }
        }
        fetchCollections()
    }, [siteId])

    // Auto-generate slug from name if not editing
    useEffect(() => {
        if (!initialData && name) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
        }
    }, [name, initialData])

    const handleAddField = (type: string) => {
        const fieldLabel = "New Field"
        const fieldName = `field_${fields.length + 1}`

        setFields([
            ...fields,
            {
                id: Math.random().toString(36).substr(2, 9),
                type,
                label: fieldLabel,
                name: fieldName,
                required: false,
                options: [], // Initialize options array for select types
                relatedCollectionId: "" // Initialize for relations
            }
        ])
        setNewFieldPopoverOpen(false)
    }

    const removeField = (index: number) => {
        const newFields = [...fields]
        newFields.splice(index, 1)
        setFields(newFields)
    }

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields]
        newFields[index] = { ...newFields[index], [key]: value }

        // Auto-update field name (slug) when label changes for UX
        if (key === 'label') {
            newFields[index].name = value.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "")
        }

        setFields(newFields)
    }

    // Handlers for Option tags
    const handleAddOption = (fieldIndex: number) => {
        const inputValue = optionInputs[fieldIndex]?.trim()
        if (!inputValue) return

        const currentOptions = fields[fieldIndex].options || []
        if (currentOptions.includes(inputValue)) {
            toast.error("Option already exists")
            return
        }

        updateField(fieldIndex, 'options', [...currentOptions, inputValue])
        setOptionInputs(prev => ({ ...prev, [fieldIndex]: "" }))
    }

    const handleRemoveOption = (fieldIndex: number, optionToRemove: string) => {
        const currentOptions = fields[fieldIndex].options || []
        updateField(fieldIndex, 'options', currentOptions.filter((opt: string) => opt !== optionToRemove))
    }

    const handleSave = async () => {
        if (!name) {
            toast.error("Collection name is required")
            return
        }

        // Validate fields
        for (const field of fields) {
            if (field.type === 'select' && (!field.options || field.options.length === 0)) {
                toast.error(`Field "${field.label}" requires at least one option`)
                return
            }
            if (field.type === 'relation' && !field.relatedCollectionId) {
                toast.error(`Field "${field.label}" requires a referenced collection`)
                return
            }
        }

        try {
            setLoading(true)
            const collectionData = {
                siteId,
                name,
                description,
                fields
            }

            let res
            if (initialData) {
                res = await updateCollection(initialData.id, collectionData)
            } else {
                res = await createCollection(collectionData)
            }

            if (res.success) {
                toast.success(initialData ? "Collection updated" : "Collection created")
                onSuccess()
            } else {
                toast.error(res.error || "Failed to save collection")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen bg-background dark:bg-zinc-950 overflow-hidden">
            {/* Left Sidebar: Settings */}
            <div className="w-[500px] flex flex-col border-r border-border/40 h-full max-h-screen">
                {/* Header */}
                <div className="h-14 border-b border-border/40 flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-sm">
                            {initialData ? "Edit Collection" : "New Collection"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>
                        <Button size="sm" onClick={handleSave} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create Collection"}
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-[calc(100vh-56px)]">
                    {/* Main Sidebar Content - Flex Column */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* Basic Info Section - Fixed at Top */}
                        <div className="p-6 pb-4 space-y-4 shrink-0">
                            <div className="space-y-1">
                                <Label className="flex items-center gap-1">
                                    Collection Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="E.g. Blog Posts"
                                    className="bg-muted/30"
                                />
                                <div className="text-[10px] text-muted-foreground flex gap-2 pt-1">
                                    <span>Plural: <strong>{name ? name + 's' : 'Items'}</strong></span>
                                    <span>Singular: <strong>{name ? name : 'Item'}</strong></span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="flex items-center gap-1">
                                    Collection URL
                                </Label>
                                <div className="flex items-center gap-2 bg-muted/30 border rounded-md px-3 py-2 text-sm text-muted-foreground">
                                    <span>website.com/</span>
                                    <input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="bg-transparent border-none outline-none text-foreground w-full p-0 h-auto focus:ring-0"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    The folder where your item pages will be stored.
                                </p>
                            </div>
                        </div>

                        <Separator className="shrink-0" />

                        {/* Fields Section - Takes remaining space and scrolls */}
                        <div className="flex-1 flex flex-col min-h-0 p-6 pt-4">
                            <div className="flex items-center justify-between mb-4 shrink-0">
                                <Label className="text-base font-medium">Collection Fields</Label>
                            </div>

                            <ScrollArea className="flex-1 -mr-4 pr-4">
                                <div className="space-y-3 pb-4">
                                    {fields.map((field, index) => {
                                        const Icon = FIELD_TYPES.find(f => f.type === field.type)?.icon || FileText
                                        const isSelect = field.type === 'select'
                                        const isRelation = field.type === 'relation'

                                        return (
                                            <div key={field.id || index} className="group border rounded-lg bg-background p-3 space-y-4 hover:border-primary/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                                                        <Icon className="h-4 w-4 opacity-70" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Label</Label>
                                                            <Input
                                                                value={field.label}
                                                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                                                className="h-8 text-sm px-2 bg-transparent"
                                                                placeholder="Field Label"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Field Name</Label>
                                                            <div className="h-8 flex items-center px-2 text-xs font-mono bg-muted/30 rounded border border-transparent">
                                                                {field.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 self-end pb-0.5">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeField(index)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Configuration Row */}
                                                <div className="bg-muted/20 -mx-3 -mb-3 p-3 rounded-b-lg border-t space-y-3">
                                                    <div className="flex items-center gap-6">
                                                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => updateField(index, 'required', e.target.checked)}
                                                                className="rounded border-input text-primary focus:ring-primary w-4 h-4 bg-background"
                                                            />
                                                            Required Field
                                                        </label>
                                                    </div>

                                                    {isSelect && (
                                                        <div className="space-y-2 pt-2 border-t border-border/50">
                                                            <Label className="text-xs font-medium mb-1.5 block">Options</Label>
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {Array.isArray(field.options) && field.options.map((opt: string) => (
                                                                    <Badge key={opt} variant="secondary" className="gap-1 pr-1 font-normal">
                                                                        {opt}
                                                                        <div
                                                                            role="button"
                                                                            onClick={() => handleRemoveOption(index, opt)}
                                                                            className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center cursor-pointer"
                                                                        >
                                                                            <X className="h-2 w-2" />
                                                                        </div>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    className="h-8 bg-background flex-1"
                                                                    placeholder="Type option and Enter..."
                                                                    value={optionInputs[index] || ""}
                                                                    onChange={(e) => setOptionInputs({ ...optionInputs, [index]: e.target.value })}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault()
                                                                            handleAddOption(index)
                                                                        }
                                                                    }}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    className="h-8 px-3"
                                                                    onClick={() => handleAddOption(index)}
                                                                >
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isRelation && (
                                                        <div className="space-y-2 pt-2 border-t border-border/50">
                                                            <Label className="text-xs font-medium mb-1.5 block">Reference Collection</Label>
                                                            <Select
                                                                value={field.relatedCollectionId || ""}
                                                                onValueChange={(val) => updateField(index, 'relatedCollectionId', val)}
                                                            >
                                                                <SelectTrigger className="h-8 bg-background">
                                                                    <SelectValue placeholder="Select a collection..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {availableCollections.length === 0 ? (
                                                                        <div className="p-2 text-xs text-muted-foreground text-center">No collections found</div>
                                                                    ) : (
                                                                        availableCollections.map(col => (
                                                                            <SelectItem key={col.id} value={col.id}>
                                                                                {col.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <p className="text-[10px] text-muted-foreground">Select the collection this field will reference.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>

                            {/* Add New Field Section - Fixed at Bottom of fields area */}
                            <div className="pt-4 mt-auto shrink-0">
                                {!newFieldPopoverOpen ? (
                                    <Button
                                        className="w-full h-12 border-dashed border-2 bg-transparent hover:bg-muted/50 text-muted-foreground rounded-none"
                                        variant="outline"
                                        onClick={() => setNewFieldPopoverOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Field
                                    </Button>
                                ) : (
                                    <div className="border bg-background shadow-lg animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[400px]">
                                        <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
                                            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Select Field Type
                                            </span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-none hover:bg-destructive hover:text-destructive-foreground" onClick={() => setNewFieldPopoverOpen(false)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <ScrollArea className="flex-1 bg-background">
                                            <div className="p-2">
                                                <div className="grid grid-cols-2 gap-px bg-border border">
                                                    {FIELD_TYPES.map((item) => (
                                                        <button
                                                            key={item.type}
                                                            onClick={() => handleAddField(item.type)}
                                                            className="flex flex-col items-center justify-center gap-2 p-4 bg-background hover:bg-muted/50 hover:text-foreground text-muted-foreground transition-colors group outline-none focus-visible:bg-muted/50"
                                                        >
                                                            <item.icon className="h-5 w-5 mb-1" />
                                                            <span className="text-xs font-medium">{item.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Right: Preview */}
            <div className="flex-1 bg-muted/10 h-full flex flex-col min-w-0">
                <div className="h-14 border-b border-border/40 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Editor Preview</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-12">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">New {name || "Item"}</h2>
                            <p className="text-sm text-muted-foreground">This is the form that Collaborators will see when creating a new Item in this collection.</p>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            {/* Preview of Form Fields */}
                            {fields.map((field, index) => (
                                <div key={index} className="space-y-2 max-w-lg">
                                    <Label>
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>

                                    {/* Mock Inputs based on type */}
                                    {field.type === 'textarea' || field.type === 'richtext' ? (
                                        <div className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                                            Text area...
                                        </div>
                                    ) : field.type === 'boolean' ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="h-5 w-9 rounded-full bg-input relative">
                                                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow-sm"></div>
                                            </div>
                                        </div>
                                    ) : field.type === 'image' || field.type === 'multi-image' ? (
                                        <div className="h-32 w-full rounded-md border border-dashed border-input bg-muted/20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <ImageIcon className="h-8 w-8 opacity-50" />
                                            <span className="text-xs">Drag and drop image</span>
                                        </div>
                                    ) : field.type === 'select' ? (
                                        <div className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center justify-between">
                                            <span>Select choice...</span>
                                            <List className="h-4 w-4 opacity-50" />
                                        </div>
                                    ) : field.type === 'relation' ? (
                                        <div className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center justify-between cursor-pointer hover:bg-muted/50">
                                            <span>Select item...</span>
                                            <Plus className="h-4 w-4 opacity-50" />
                                        </div>
                                    ) : (
                                        <div className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                                            Input...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
