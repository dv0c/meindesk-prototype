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
import { Separator } from "@/components/ui/separator"
import { CreateCategory } from "@/lib/actions/helpers/create-category"
import { NavPlacementPicker } from "@/components/builder/cms/NavPlacementPicker"
import type { NavPlacement } from "@/lib/category-metadata"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface CreateCategoryDialogProps {
    siteId: string
    onSuccess?: () => void
}

export function CreateCategoryDialog({ siteId, onSuccess }: CreateCategoryDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [navPlacement, setNavPlacement] = useState<NavPlacement>("none")
    const [navOrder, setNavOrder] = useState(0)

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !slug) return

        try {
            setLoading(true)
            await CreateCategory({
                siteId,
                data: {
                    name,
                    slug,
                    description,
                    published: true,
                    navPlacement,
                    navOrder,
                }
            })
            toast.success("Category created")
            setOpen(false)
            setName("")
            setSlug("")
            setDescription("")
            setNavPlacement("none")
            setNavOrder(0)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Failed to create category")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Category
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>
                        Add a new category to organize your content.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="e.g. Technology"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g. technology"
                                className="font-mono text-sm"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
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
                                    <Label htmlFor="nav-order" className="text-xs text-muted-foreground font-normal">
                                        Sort order
                                    </Label>
                                    <Input
                                        id="nav-order"
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
