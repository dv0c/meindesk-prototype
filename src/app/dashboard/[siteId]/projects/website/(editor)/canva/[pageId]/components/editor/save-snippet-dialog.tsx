"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { LayoutNode } from "@/lib/types"
import { toast } from "sonner"

interface SaveSnippetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    siteId: string
    content: LayoutNode[]
    onSaved: (snippetId: string, snippetName: string) => void
}

const SNIPPET_CATEGORIES = [
    { value: "header", label: "Header" },
    { value: "footer", label: "Footer" },
    { value: "hero", label: "Hero" },
    { value: "section", label: "Section" },
    { value: "navigation", label: "Navigation" },
    { value: "form", label: "Form" },
    { value: "card", label: "Card" },
    { value: "custom", label: "Custom" },
]

export function SaveSnippetDialog({
    open,
    onOpenChange,
    siteId,
    content,
    onSaved,
}: SaveSnippetDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("custom")
    const [saving, setSaving] = useState(false)

    const componentCount = countNodes(content)

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter a snippet name")
            return
        }

        setSaving(true)
        try {
            const response = await fetch(`/api/v1/${siteId}/snippets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    category,
                    content,
                }),
            })

            if (response.ok) {
                const savedSnippet = await response.json()
                toast.success(`Snippet "${name}" saved successfully`)
                setName("")
                setDescription("")
                setCategory("custom")
                onOpenChange(false)
                onSaved(savedSnippet.id, savedSnippet.name)
            } else {
                const error = await response.json()
                toast.error(error.error || "Failed to save snippet")
            }
        } catch (error) {
            console.error("Failed to save snippet:", error)
            toast.error("Failed to save snippet")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save as Snippet</DialogTitle>
                    <DialogDescription>
                        Save this component{componentCount > 1 ? ` and its ${componentCount - 1} children` : ""} as a reusable snippet.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Hero Section, Contact Form"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description for this snippet"
                            rows={2}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {SNIPPET_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !name.trim()}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Snippet"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Helper function to count nodes recursively
function countNodes(nodes: LayoutNode[]): number {
    let count = 0
    for (const node of nodes) {
        count++
        if (node.children) {
            count += countNodes(node.children)
        }
    }
    return count
}
