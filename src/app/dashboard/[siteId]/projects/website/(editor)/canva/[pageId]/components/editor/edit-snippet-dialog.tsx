"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { LayoutNode } from "@/lib/types"
import { toast } from "sonner"

interface EditSnippetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    snippetId: string
    siteId: string
    onSaved?: () => void
}

export function EditSnippetDialog({
    open,
    onOpenChange,
    snippetId,
    siteId,
    onSaved
}: EditSnippetDialogProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("custom")

    // Fetch snippet data when dialog opens
    useState(() => {
        if (open && snippetId) {
            setLoading(true)
            fetch(`/api/v1/${siteId}/snippets/${snippetId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || "")
                    setDescription(data.description || "")
                    setCategory(data.category || "custom")
                })
                .catch(err => {
                    console.error("Failed to load snippet:", err)
                    toast.error("Failed to load snippet")
                })
                .finally(() => setLoading(false))
        }
    })

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Name is required")
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/v1/${siteId}/snippets/${snippetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    category: category || "custom",
                }),
            })

            if (response.ok) {
                toast.success("Snippet updated successfully")
                onSaved?.()
                onOpenChange(false)
            } else {
                const error = await response.json()
                toast.error(error.message || "Failed to update snippet")
            }
        } catch (error) {
            console.error("Failed to update snippet:", error)
            toast.error("Failed to update snippet")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Snippet</DialogTitle>
                    <DialogDescription>
                        Update the snippet name, description, or category.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Hero Section"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of this snippet..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            placeholder="e.g., header, footer, section"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
