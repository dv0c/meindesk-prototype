"use client"

import { useEffect, useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { updateItem, getItem, getItems } from "@/lib/actions/item-actions"
import { getCollection } from "@/lib/actions/collection-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Save, Loader2, Upload, Link as LinkIcon, Database, Terminal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import MediaLibraryDialog from "@/components/MediaGallery/media-select"

// Import Setup components
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"

export default function EditItemPage() {
    const params = useParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [collection, setCollection] = useState<any>(null)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [relationOptions, setRelationOptions] = useState<Record<string, any[]>>({})
    const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
    const [activeImageField, setActiveImageField] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            const itemRes = await getItem(params.itemId as string)

            if (itemRes.item) {
                setFormData(itemRes.item.data as any)
                setCollection(itemRes.item.collection)

                // Fetch Related Items
                const relationFields = itemRes.item.collection.fields.filter((f: any) => f.type === 'relation' && f.relatedCollectionId)
                const relationMap: Record<string, any[]> = {}

                await Promise.all(relationFields.map(async (f: any) => {
                    const itemsRes = await getItems(f.relatedCollectionId)
                    if (itemsRes.items) {
                        relationMap[f.name] = itemsRes.items
                    }
                }))
                setRelationOptions(relationMap)

            } else {
                toast.error("Failed to load item")
                router.back()
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const handleFieldChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleMediaSelect = (items: any[]) => {
        if (activeImageField && items.length > 0) {
            handleFieldChange(activeImageField, items[0].url)
        }
        setIsMediaDialogOpen(false)
    }

    const toggleMultiSelectRelation = (fieldName: string, itemId: string) => {
        const current = formData[fieldName] || []
        if (current.includes(itemId)) {
            handleFieldChange(fieldName, current.filter((id: string) => id !== itemId))
        } else {
            handleFieldChange(fieldName, [...current, itemId])
        }
    }

    const handleSubmit = () => {
        // Basic Validation
        const missingRequired = collection.fields.filter((f: any) => f.required && (formData[f.name] === undefined || formData[f.name] === ""))
        if (missingRequired.length > 0) {
            toast.error(`Missing required fields: ${missingRequired.map((f: any) => f.label).join(", ")}`)
            return
        }

        startTransition(async () => {
            const res = await updateItem(params.itemId as string, formData, "PUBLISHED")

            if (res.success) {
                toast.success("SYSTEM UPDATE: ITEM UPDATED")
                // router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}`)
            } else {
                toast.error(res.error || "CRITICAL FAILURE")
            }
        })
    }

    // Helper to get display name safely
    const getDisplayName = (item: any) => {
        if (!item || !item.data) return "Unknown Item"
        // 1. Try common title fields
        if (item.data.title) return item.data.title
        if (item.data.name) return item.data.name
        // 2. Try to find the first string field that is NOT an ID or URL (heuristic)
        const possibleKeys = Object.keys(item.data).filter(k =>
            typeof item.data[k] === 'string' &&
            !k.toLowerCase().includes('id') &&
            !k.toLowerCase().includes('url') &&
            !k.toLowerCase().includes('image') &&
            item.data[k].length < 100 // Avoid long text fields
        )
        if (possibleKeys.length > 0) return item.data[possibleKeys[0]]

        // 3. Fallback to slug or ID
        return item.slug || item.id
    }

    if (loading) return (
        <div className="fixed inset-0 bg-background flex items-center justify-center font-mono">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
                <ScrambleTextOnHover text="LOADING DATA..." />
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 bg-background text-foreground font-mono z-50 flex flex-col overflow-hidden">
            <AnimatedNoise opacity={0.05} />

            {/* Header */}
            <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-foreground/10 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center bg-foreground/5">
                        <Terminal className="w-4 h-4 text-foreground/80" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:inline-block">
                        Data Entry System
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:hidden">
                        Edit Entry
                    </span>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="font-mono text-xs uppercase tracking-widest hover:bg-foreground/5"
                    >
                        <ScrambleTextOnHover text="BACK" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 px-4 py-8 md:px-6 md:py-12">
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <h1 className="font-[var(--font-bebas)] text-3xl md:text-5xl text-center mb-4 tracking-wide text-foreground/80 uppercase">
                            EDIT {collection.name?.slice(0, -1) || "ITEM"}
                        </h1>
                        <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-12">
                            // ID: {params.itemId}
                        </p>

                        <div className="space-y-8 bg-foreground/[0.02] border border-foreground/10 p-6 md:p-8 backdrop-blur-sm">
                            {collection.fields.map((field: any) => (
                                <div key={field.name} className="space-y-2 group">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground group-focus-within:text-foreground transition-colors">
                                        {field.label} {field.required && <span className="text-destructive">*</span>}
                                    </Label>

                                    {field.type === 'text' && (
                                        <div className="relative">
                                            <Input
                                                value={formData[field.name] || ""}
                                                onChange={e => handleFieldChange(field.name, e.target.value)}
                                                placeholder={`ENTER ${field.label.toUpperCase()}...`}
                                                className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 h-10 md:h-12 font-mono placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:border-foreground transition-all"
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    )}

                                    {field.type === 'richtext' && (
                                        <Textarea
                                            value={formData[field.name] || ""}
                                            onChange={e => handleFieldChange(field.name, e.target.value)}
                                            placeholder={`// ENTER ${field.label.toUpperCase()} CONTENT...`}
                                            className="min-h-[120px] bg-background/50 border-foreground/20 rounded-none font-mono text-sm placeholder:text-foreground/20 focus-visible:ring-1 focus-visible:ring-foreground resize-none"
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={formData[field.name] || ""}
                                                onChange={e => handleFieldChange(field.name, parseFloat(e.target.value))}
                                                placeholder="0"
                                                className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 h-10 md:h-12 font-mono placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:border-foreground transition-all"
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    )}

                                    {field.type === 'date' && (
                                        <Input
                                            type="date"
                                            value={formData[field.name] || ""}
                                            onChange={e => handleFieldChange(field.name, e.target.value)}
                                            className="bg-background/50 border-foreground/20 rounded-none h-10"
                                        />
                                    )}

                                    {field.type === 'boolean' && (
                                        <div className="flex items-center space-x-3 pt-2">
                                            <Switch
                                                checked={formData[field.name] || false}
                                                onCheckedChange={c => handleFieldChange(field.name, c)}
                                            />
                                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{formData[field.name] ? "ACTIVE / YES" : "INACTIVE / NO"}</span>
                                        </div>
                                    )}

                                    {field.type === 'select' && (
                                        <Select value={formData[field.name]} onValueChange={v => handleFieldChange(field.name, v)}>
                                            <SelectTrigger className="bg-background/50 border-foreground/20 rounded-none h-10">
                                                <SelectValue placeholder="SELECT OPTION" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt: string) => (
                                                    <SelectItem key={opt} value={opt} className="font-mono text-xs">{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === 'image' && (
                                        <div className="border border-dashed border-foreground/20 bg-background/30 p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-foreground/5 transition-colors cursor-pointer group/image"
                                            onClick={() => {
                                                setActiveImageField(field.name)
                                                setIsMediaDialogOpen(true)
                                            }}
                                        >
                                            {formData[field.name] ? (
                                                <div className="relative w-full h-48 group-hover/image:opacity-80 transition-opacity">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={formData[field.name]} alt="Preview" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" />
                                                    <Button size="sm" variant="destructive" className="absolute top-2 right-2 rounded-none opacity-0 group-hover/image:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleFieldChange(field.name, "") }}>REMOVE</Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                                                    <span className="text-[10px] uppercase tracking-widest">Upload Asset</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Relation Handling */}
                                    {field.type === 'relation' && (
                                        <div className="space-y-2">
                                            {field.relationType === 'one-to-many' ? (
                                                <div className="border border-foreground/20 rounded-none p-4 space-y-2 max-h-48 overflow-y-auto bg-background/50">
                                                    {(relationOptions[field.name] || []).length === 0 ? (
                                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center py-2">No items found</div>
                                                    ) : (
                                                        (relationOptions[field.name] || []).map((item: any) => {
                                                            const isSelected = (formData[field.name] || []).includes(item.id)
                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-2 cursor-pointer transition-colors border border-transparent",
                                                                        isSelected ? "bg-foreground/10 border-foreground/20" : "hover:bg-foreground/5"
                                                                    )}
                                                                    onClick={() => toggleMultiSelectRelation(field.name, item.id)}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={cn("w-4 h-4 border border-foreground/40 flex items-center justify-center transition-colors", isSelected ? "bg-foreground border-foreground" : "")}>
                                                                            {isSelected && <div className="w-2 h-2 bg-background" />}
                                                                        </div>
                                                                        <span className="text-xs font-mono">{getDisplayName(item)}</span>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-[10px] rounded-none border-foreground/20 font-mono">{item.status}</Badge>
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            ) : (
                                                <Select value={formData[field.name]} onValueChange={v => handleFieldChange(field.name, v)}>
                                                    <SelectTrigger className="bg-background/50 border-foreground/20 rounded-none h-10">
                                                        <SelectValue placeholder="SELECT RELATED ITEM" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(relationOptions[field.name] || []).map((item: any) => (
                                                            <SelectItem key={item.id} value={item.id} className="font-mono text-xs">
                                                                {getDisplayName(item)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <MediaLibraryDialog
                    siteId={params.siteId as string}
                    isOpen={isMediaDialogOpen}
                    onClose={() => setIsMediaDialogOpen(false)}
                    onSelect={handleMediaSelect}
                />
            </main>

            {/* Footer */}
            <footer className="border-t border-foreground/10 bg-background/80 backdrop-blur-sm relative z-10 shrink-0">
                <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            <div className="w-24 h-1 bg-foreground" />
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Version Control Active
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="group relative px-6 md:px-8 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <ScrambleTextOnHover
                                    text={isPending ? "UPDATING..." : "UPDATE ENTRY"}
                                    as="span"
                                    duration={0.3}
                                />
                                {!isPending && <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">{">"}</span>}
                            </span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}
