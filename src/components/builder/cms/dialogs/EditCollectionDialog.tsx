"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { updateCollection } from "@/lib/actions/collection-actions"
import { Loader2, Plus, Trash2, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface EditCollectionDialogProps {
    collection: any
    onSuccess?: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditCollectionDialog({ collection, onSuccess, open, onOpenChange }: EditCollectionDialogProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(collection.name || "")
    const [description, setDescription] = useState(collection.description || "")
    const [fields, setFields] = useState<any[]>(collection.fields || [])

    useEffect(() => {
        if (open) {
            setName(collection.name)
            setDescription(collection.description)
            setFields(collection.fields || [])
        }
    }, [open, collection])

    const handleAddField = () => {
        setFields([...fields, { name: "", type: "text", label: "", required: false }])
    }

    const handleRemoveField = (index: number) => {
        const newFields = [...fields]
        newFields.splice(index, 1)
        setFields(newFields)
    }

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields]
        newFields[index] = { ...newFields[index], [key]: value }

        // Auto-generate name from label if name is empty
        if (key === "label" && !newFields[index].name) {
            newFields[index].name = value.toLowerCase().replace(/[^a-z0-9_]+/g, "_")
        }

        setFields(newFields)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        // Basic validation
        if (fields.length === 0) {
            toast.error("At least one field is required")
            return
        }

        try {
            setLoading(true)
            const res = await updateCollection(collection.id, {
                name,
                description,
                fields
            })

            if (res.success) {
                toast.success("Collection updated")
                onOpenChange(false)
                onSuccess?.()
            } else {
                toast.error(res.error || "Failed to update collection")
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update collection")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                    <DialogDescription>
                        Modify collection structure and fields.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Blog Posts"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Fields</Label>
                            <Button type="button" size="sm" variant="outline" onClick={handleAddField}>
                                <Plus className="h-3 w-3 mr-2" />
                                Add Field
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={index} className="flex flex-col gap-3 p-3 border rounded-md bg-muted/20 relative group">
                                    <div className="flex gap-3 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs">Label</Label>
                                            <Input
                                                value={field.label}
                                                onChange={(e) => updateField(index, "label", e.target.value)}
                                                placeholder="e.g. Title"
                                                className="h-8"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs">Key Name</Label>
                                            <Input
                                                value={field.name}
                                                onChange={(e) => updateField(index, "name", e.target.value)}
                                                placeholder="e.g. title"
                                                className="h-8 font-mono text-xs"
                                            />
                                        </div>
                                        <div className="w-[120px] space-y-2">
                                            <Label className="text-xs">Type</Label>
                                            <Select value={field.type} onValueChange={(val) => updateField(index, "type", val)}>
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="richtext">Rich Text</SelectItem>
                                                    <SelectItem value="image">Image</SelectItem>
                                                    <SelectItem value="number">Number</SelectItem>
                                                    <SelectItem value="boolean">Boolean</SelectItem>
                                                    <SelectItem value="date">Date</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={`required-${index}`}
                                                checked={field.required}
                                                onCheckedChange={(checked) => updateField(index, "required", checked)}
                                                className="scale-75 origin-left"
                                            />
                                            <Label htmlFor={`required-${index}`} className="text-xs text-muted-foreground">Required</Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive p-0"
                                            onClick={() => handleRemoveField(index)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-md">
                                    No fields defined. Add a field to start.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
