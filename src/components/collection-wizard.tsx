"use client"

import { useState, useTransition, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createCollection, getCollections } from "@/lib/actions/collection-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Trash2, GripVertical, CheckCircle2, Link as LinkIcon, Database } from "lucide-react"
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion"
import { cn } from "@/lib/utils"
// Import Setup components
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export type FieldType = "text" | "richtext" | "number" | "image" | "boolean" | "date" | "select" | "relation"

export interface FieldDefinition {
    id: string
    name: string
    label: string
    type: FieldType
    required: boolean
    options?: string
    relatedCollectionId?: string
    relationType?: "one-to-one" | "one-to-many"
}

interface CollectionWizardProps {
    onComplete: (data: any) => void
    existingCollections?: any[] // For relation targets
    // Edit mode props
    mode?: 'create' | 'edit'
    initialData?: {
        name: string
        description?: string
        fields: any[]
    }
    onDelete?: () => void
    backCheckPath?: string // Where to go back on step 0
}

export function CollectionWizard({ onComplete, existingCollections = [], mode = 'create', initialData, onDelete, backCheckPath }: CollectionWizardProps) {
    const router = useRouter()
    const params = useParams()
    const [step, setStep] = useState(mode === 'edit' ? 2 : 1) // In edit mode start at schema
    const totalSteps = 3

    // Form Data
    const [name, setName] = useState(initialData?.name || "")
    const [description, setDescription] = useState(initialData?.description || "")

    // Initialize fields. If edit mode, map existing fields to include an internal ID
    const [fields, setFields] = useState<FieldDefinition[]>(
        initialData?.fields ?
            initialData.fields.map((f: any) => ({ ...f, id: Math.random().toString(), options: Array.isArray(f.options) ? f.options.join(', ') : f.options })) :
            [{ id: "1", name: "title", label: "Title", type: "text", required: true }]
    )

    // Field Logic
    const addField = () => {
        setFields([...fields, {
            id: crypto.randomUUID(),
            name: "",
            label: "",
            type: "text",
            required: false
        }])
    }

    const removeField = (id: string) => {
        if (fields.length <= 1) {
            toast.error("Collection must have at least one field")
            return
        }
        setFields(fields.filter(f => f.id !== id))
    }

    const updateField = (id: string, updates: Partial<FieldDefinition>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    const handleLabelChange = (id: string, label: string) => {
        const field = fields.find(f => f.id === id)
        if (field && !field.name) {
            const autoName = label.toLowerCase().replace(/[^a-z0-9_]/g, "_")
            updateField(id, { label, name: autoName })
        } else {
            updateField(id, { label })
        }
    }

    const canProceed = () => {
        if (step === 1) return !!name.trim()
        if (step === 2) return fields.every(f => f.name && f.label)
        return true
    }

    const handleSubmit = () => {
        onComplete({
            step1: { name, description },
            step2: fields.map(f => ({
                name: f.name,
                label: f.label,
                type: f.type,
                required: f.required,
                options: f.type === 'select' && f.options ? f.options.split(',').map(s => s.trim()) : undefined,
                relatedCollectionId: f.type === 'relation' ? f.relatedCollectionId : undefined,
                relationType: f.type === 'relation' ? f.relationType : undefined
            }))
        })
    }

    return (
        <div className="fixed inset-0 bg-background text-foreground font-mono z-50 flex flex-col overflow-hidden">
            <AnimatedNoise opacity={0.05} />

            {/* Header */}
            <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-foreground/10 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center bg-foreground/5">
                        <Database className="w-4 h-4 text-foreground/80" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:inline-block">
                        {mode === 'edit' ? "Schema Modification" : "Data Schema Initialization"}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:hidden">
                        Schema
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => backCheckPath ? router.push(backCheckPath) : router.back()}
                    className="font-mono text-xs uppercase tracking-widest hover:bg-foreground/5"
                >
                    <ScrambleTextOnHover text="ABORT" />
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 px-4 py-8 md:px-6 md:py-12">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <AnimatePresence mode="wait">

                        {/* Step 1: Identity */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center"
                            >
                                <h1 className="font-[var(--font-bebas)] text-3xl md:text-5xl text-center mb-4 tracking-wide text-foreground/80">
                                    COLLECTION IDENTITY
                                </h1>
                                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-16">
                                    // Define content type parameters
                                </p>

                                <div className="w-full max-w-lg space-y-8">
                                    <div className="space-y-4">
                                        <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Collection Name (Plural)</Label>
                                        <div className="relative group">
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. TICKETS"
                                                className="h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-xl font-mono placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:border-foreground transition-all"
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Description (Optional)</Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="// ENTER DESCRIPTION..."
                                            className="min-h-[100px] bg-transparent border border-foreground/20 rounded-none p-4 font-mono text-sm placeholder:text-foreground/20 focus-visible:ring-1 focus-visible:ring-foreground resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Schema */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center"
                            >
                                <h1 className="font-[var(--font-bebas)] text-3xl md:text-5xl text-center mb-4 tracking-wide text-foreground/80">
                                    SCHEMA MATRIX
                                </h1>
                                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-12">
                                    // Construct and Arrange data fields
                                </p>

                                <div className="w-full space-y-4">
                                    <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
                                        {fields.map((field) => (
                                            <Reorder.Item key={field.id} value={field} dragListener={false}>
                                                <div className="group/item relative grid gap-4 p-4 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">

                                                    <div className="absolute right-2 top-2 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeField(field.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>

                                                    <DragItemContent
                                                        field={field}
                                                        updateField={updateField}
                                                        handleLabelChange={handleLabelChange}
                                                        availableCollections={existingCollections}
                                                    />
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>

                                    <Button
                                        variant="outline"
                                        onClick={addField}
                                        className="w-full border-dashed border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 h-12 uppercase tracking-widest text-xs font-mono"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Insert Field Module
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center"
                            >
                                <h1 className="font-[var(--font-bebas)] text-3xl md:text-5xl text-center mb-4 tracking-wide text-foreground/80">
                                    SYSTEM PREVIEW
                                </h1>
                                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-12">
                                    // Confirm initialization parameters
                                </p>

                                <div className="w-full max-w-lg border border-foreground/20 bg-foreground/[0.02] p-6 space-y-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Identity</div>
                                        <div className="font-[var(--font-bebas)] text-2xl tracking-wide">{name}</div>
                                        <div className="font-mono text-xs text-muted-foreground">{description || "No description provided"}</div>
                                    </div>

                                    <Separator className="bg-foreground/10" />

                                    <div className="space-y-4">
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Structure Map</div>
                                        {fields.map(f => (
                                            <div key={f.id} className="flex items-center justify-between font-mono text-xs">
                                                <span className="text-foreground/80">{f.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">{f.type}</span>
                                                    {f.type === 'relation' && <span className="text-muted-foreground text-[10px] border px-1 rounded">Linked</span>}
                                                    {f.required && <span className="text-destructive text-[10px] border border-destructive/30 px-1 rounded">REQ</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-green-500/80 text-xs font-mono border p-2 border-green-500/20 bg-green-500/5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>CONFIGURATION VALID. READY FOR DEPLOYMENT.</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-foreground/10 bg-background/80 backdrop-blur-sm relative z-10 shrink-0">
                <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span className="hidden sm:inline">Module</span> 0{step} / 0{totalSteps}
                        </div>
                        {/* Industrial Steps Visualization */}
                        <div className="hidden sm:flex gap-1">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-8 h-1 transition-all duration-300",
                                        i + 1 <= step ? "bg-foreground" : "bg-foreground/10"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {mode === 'edit' && onDelete && (
                            <button
                                onClick={onDelete}
                                className="font-mono text-[10px] uppercase tracking-[0.2em] text-destructive hover:text-destructive/80 transition-colors mr-4"
                            >
                                <ScrambleTextOnHover text="DELETE SYSTEM" />
                            </button>
                        )}

                        <Button
                            variant="ghost"
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            className={cn(
                                "font-mono text-xs uppercase tracking-widest hover:bg-transparent hover:text-foreground/60 rounded-none px-4",
                                step === 1 && "invisible"
                            )}
                        >
                            <span className="mr-2 text-xs">{"<"}</span>
                            BACK
                        </Button>

                        <button
                            onClick={step === totalSteps ? handleSubmit : () => setStep(s => Math.min(totalSteps, s + 1))}
                            disabled={!canProceed()}
                            className="group relative px-4 md:px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <ScrambleTextOnHover
                                    text={step === totalSteps ? (mode === 'edit' ? "UPDATE SYSTEM" : "INITIALIZE SYSTEM") : "PROCEED"}
                                    as="span"
                                    duration={0.3}
                                />
                                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">{">"}</span>
                            </span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function DragItemContent({ field, updateField, handleLabelChange, availableCollections }: { field: FieldDefinition, updateField: any, handleLabelChange: any, availableCollections: any[] }) {
    const controls = useDragControls()

    return (
        <div className="flex items-end gap-2">
            <div
                className="self-center p-2 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 touch-none"
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end flex-1">
                <div className="md:col-span-4 space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Label</Label>
                    <Input
                        value={field.label}
                        onChange={e => handleLabelChange(field.id, e.target.value)}
                        className="bg-background/50 border-foreground/10 h-8 text-sm"
                        placeholder="Field Label"
                    />
                </div>
                <div className="md:col-span-3 space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">System Key</Label>
                    <Input
                        value={field.name}
                        onChange={e => updateField(field.id, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
                        className="bg-background/50 border-foreground/10 h-8 font-mono text-xs"
                        placeholder="field_key"
                    />
                </div>
                <div className="md:col-span-3 space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</Label>
                    <Select value={field.type} onValueChange={(val: any) => updateField(field.id, { type: val })}>
                        <SelectTrigger className="h-8 bg-background/50 border-foreground/10 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="richtext">Rich Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Switch (Bool)</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="relation">Relation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="md:col-span-2 pb-1">
                    <div className="flex items-center space-x-2 border border-dashed border-foreground/20 p-1.5 rounded bg-background/30">
                        <Switch
                            id={`req-${field.id}`}
                            className="scale-75"
                            checked={field.required}
                            onCheckedChange={(c) => updateField(field.id, { required: c })}
                        />
                        <Label htmlFor={`req-${field.id}`} className="text-[10px] uppercase cursor-pointer">Req</Label>
                    </div>
                </div>

                {/* Relation Configuration */}
                {field.type === 'relation' && (
                    <div className="md:col-span-12 p-4 bg-foreground/5 border border-foreground/10 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest mb-2">
                            <LinkIcon className="w-3 h-3" /> Relation Configuration
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Relation Type</Label>
                                <RadioGroup
                                    value={field.relationType || "one-to-one"}
                                    onValueChange={(val: any) => updateField(field.id, { relationType: val })}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="one-to-one" />
                                        <Label className="font-normal text-xs">One-to-One</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="one-to-many" />
                                        <Label className="font-normal text-xs">One-to-Many</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Target Collection</Label>
                                <Select value={field.relatedCollectionId} onValueChange={(val) => updateField(field.id, { relatedCollectionId: val })}>
                                    <SelectTrigger className="h-8 bg-background/50 border-foreground/10 text-xs">
                                        <SelectValue placeholder="Select collection..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCollections.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {field.type === 'select' && (
                <div className="w-full mt-2 pl-8">
                    <Input
                        placeholder="Option 1, Option 2, Option 3"
                        value={field.options || ""}
                        onChange={e => updateField(field.id, { options: e.target.value })}
                        className="bg-background/50 border-foreground/10 h-8 text-xs font-mono"
                    />
                </div>
            )}
        </div>
    )
}

function Separator({ className }: { className?: string }) {
    return <div className={cn("h-[1px] w-full bg-border", className)} />
}
