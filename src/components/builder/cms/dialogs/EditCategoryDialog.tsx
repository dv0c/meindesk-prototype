"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { NavPlacementPicker } from "@/components/builder/cms/NavPlacementPicker"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { parseCategoryMetadata, type NavPlacement } from "@/lib/category-metadata"

export type EditCategoryRow = {
    id: string
    name: string
    slug: string
    description?: string | null
    published?: boolean
    metadata?: unknown
}

interface EditCategoryDialogProps {
    siteId: string
    category: EditCategoryRow | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditCategoryDialog({
    siteId,
    category,
    open,
    onOpenChange,
    onSuccess,
}: EditCategoryDialogProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [published, setPublished] = useState(true)
    const [navPlacement, setNavPlacement] = useState<NavPlacement>("none")
    const [navOrder, setNavOrder] = useState(0)
    const [slugTouched, setSlugTouched] = useState(false)

    useEffect(() => {
        if (!category) return
        const meta = parseCategoryMetadata(category.metadata)
        setName(category.name || "")
        setSlug(category.slug || "")
        setDescription(category.description || "")
        setPublished(category.published !== false)
        setNavPlacement(meta.navPlacement ?? "none")
        setNavOrder(meta.navOrder ?? 0)
        setSlugTouched(false)
    }, [category])

    const handleNameChange = (val: string) => {
        setName(val)
        if (!slugTouched) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!category || !name || !slug) return

        try {
            setLoading(true)
            const res = await fetch(`/api/team/${siteId}/categories/${category.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug,
                    description,
                    published,
                    navPlacement,
                    navOrder,
                }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                throw new Error(data.error || "Failed to update category")
            }
            toast.success("Category updated")
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Failed to update category")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Edit category</DialogTitle>
                    <DialogDescription>Update name, slug, description, and visibility.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="edit-cat-name">Name</Label>
                            <Input
                                id="edit-cat-name"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-cat-slug">Slug</Label>
                            <Input
                                id="edit-cat-slug"
                                value={slug}
                                onChange={(e) => {
                                    setSlugTouched(true)
                                    setSlug(e.target.value)
                                }}
                                className="font-mono text-sm"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-cat-desc">Description</Label>
                        <Textarea
                            id="edit-cat-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Navigation placement</Label>
                            {navPlacement !== "none" && (
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="edit-cat-nav-order" className="text-xs text-muted-foreground font-normal">
                                        Sort order
                                    </Label>
                                    <Input
                                        id="edit-cat-nav-order"
                                        type="number"
                                        value={navOrder}
                                        onChange={(e) => setNavOrder(parseInt(e.target.value, 10) || 0)}
                                        className="h-7 w-16 text-xs text-center"
                                    />
                                </div>
                            )}
                        </div>
                        <NavPlacementPicker value={navPlacement} onChange={setNavPlacement} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="edit-cat-published">Published</Label>
                            <p className="text-xs text-muted-foreground">Visible when browsing categories</p>
                        </div>
                        <Switch
                            id="edit-cat-published"
                            checked={published}
                            onCheckedChange={setPublished}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
