"use client"

import { useSite } from "@/components/Contexts/site-id-context"
import MediaLibraryDialog from "@/components/MediaGallery/media-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useFetch } from "@/hooks/useFetch"
import { Article } from "@prisma/client"
import { Check, ChevronsUpDown, Image as ImageIcon, Link2, Plus, Tag, Type, Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

const EditorRightSection = ({
    article,
    slug,
    setSlug,
    excerpt,
    setExcerpt,
    setThumbnail, thumbnail,
    categories: selectedCategories = [],
    setCategories
}: {
    article: Article
    slug: string
    setSlug: (val: string) => void
    excerpt: string
    setExcerpt: (val: string) => void
    setThumbnail: (val: string) => void
    thumbnail: string;
    categories?: string[];
    setCategories?: (val: string[]) => void;
}) => {
    const { siteId } = useSite()
    const [isOpen, setOpen] = useState<boolean>()
    const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false)
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)

    const { data: availableCategories, refetch } = useFetch<any[]>(
        siteId ? `/api/team/${siteId}/categories?published=true` : null
    )

    const [newCategoryForm, setNewCategoryForm] = useState({
        name: "",
        description: "",
        slug: "",
    })

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const handleCreateCategory = async () => {
        if (!siteId) return toast.error("Site not found")
        if (!newCategoryForm.name) return toast.error("Category name is required")

        try {
            const response = await fetch(`/api/team/${siteId}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCategoryForm.name,
                    description: newCategoryForm.description,
                    slug: newCategoryForm.slug || generateSlug(newCategoryForm.name),
                    published: true,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create category")
            }

            const newCategory = await response.json()
            toast.success("Category created successfully")
            setIsCreateCategoryOpen(false)
            setNewCategoryForm({ name: "", description: "", slug: "" })
            refetch()

            // Automatically select the newly created category
            if (setCategories) {
                setCategories([...(selectedCategories || []), newCategory.id])
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create category")
        }
    }

    const toggleCategory = (categoryId: string) => {
        if (!setCategories) return
        const current = selectedCategories || []
        if (current.includes(categoryId)) {
            setCategories(current.filter((id) => id !== categoryId))
        } else {
            setCategories([...current, categoryId])
        }
    }

    const removeCategory = (categoryId: string) => {
        if (!setCategories) return
        setCategories((selectedCategories || []).filter((id) => id !== categoryId))
    }

    const getSelectedCategoryNames = () => {
        if (!availableCategories || !selectedCategories) return []
        return availableCategories.filter((cat) => selectedCategories.includes(cat.id))
    }

    if (!siteId) return null

    return (
        <>
            <div className="space-y-6">
                {/* Thumbnail Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Cover Image</Label>
                    </div>
                    {thumbnail === "" ? (
                        <button
                            onClick={() => setOpen(true)}
                            className="group relative w-full h-48 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                                    Upload cover image
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Click to select from media library
                                </div>
                            </div>
                        </button>
                    ) : (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                            <Image
                                src={thumbnail}
                                alt="Cover"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setOpen(true)}
                                    className="gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Change
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setThumbnail("")
                                    }}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Slug Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="slug" className="text-sm font-medium">URL Slug</Label>
                    </div>
                    <Input
                        id="slug"
                        placeholder="article-url-slug"
                        value={slug || ""}
                        onChange={e => setSlug(e.target.value)}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        This will be the URL for your article
                    </p>
                </div>

                <Separator />

                {/* Categories Section */}
                {setCategories && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Categories</Label>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreateCategoryOpen(true)}
                                className="h-7 gap-1.5 text-xs"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                New
                            </Button>
                        </div>

                        {/* Selected categories */}
                        {getSelectedCategoryNames().length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {getSelectedCategoryNames().map((category) => (
                                    <Badge key={category.id} variant="secondary" className="gap-1.5 pr-1 pl-2.5">
                                        {category.name}
                                        <button
                                            onClick={() => removeCategory(category.id)}
                                            className="ml-0.5 rounded-sm hover:bg-muted p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Category selector */}
                        <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={categoryPopoverOpen}
                                    className="w-full justify-between h-9 font-normal"
                                >
                                    <span className="text-muted-foreground text-sm">
                                        {getSelectedCategoryNames().length > 0
                                            ? `${getSelectedCategoryNames().length} selected`
                                            : "Select categories..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search categories..." />
                                    <CommandEmpty>No categories found.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {availableCategories?.map((category) => (
                                            <CommandItem
                                                key={category.id}
                                                value={category.name}
                                                onSelect={() => toggleCategory(category.id)}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Checkbox
                                                        checked={selectedCategories?.includes(category.id)}
                                                        onCheckedChange={() => toggleCategory(category.id)}
                                                    />
                                                    <span className="text-sm">{category.name}</span>
                                                </div>
                                                <Check
                                                    className={`ml-auto h-4 w-4 ${selectedCategories?.includes(category.id) ? "opacity-100" : "opacity-0"
                                                        }`}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <Separator />

                {/* Excerpt Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                    </div>
                    <Textarea
                        id="excerpt"
                        placeholder="Brief summary of your article..."
                        value={excerpt || ""}
                        onChange={e => setExcerpt(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        A short description that appears in article previews
                    </p>
                </div>
            </div>

            {/* Create Category Dialog */}
            <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>
                            Add a new category to organize your articles
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Name *</Label>
                            <Input
                                id="cat-name"
                                value={newCategoryForm.name}
                                onChange={(e) => {
                                    setNewCategoryForm({ ...newCategoryForm, name: e.target.value })
                                    if (!newCategoryForm.slug) {
                                        setNewCategoryForm({ ...newCategoryForm, name: e.target.value, slug: generateSlug(e.target.value) })
                                    }
                                }}
                                placeholder="Technology"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-slug">Slug *</Label>
                            <Input
                                id="cat-slug"
                                value={newCategoryForm.slug}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, slug: e.target.value })}
                                placeholder="technology"
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-description">Description</Label>
                            <Textarea
                                id="cat-description"
                                value={newCategoryForm.description}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                                placeholder="Category description..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCategory}>Create & Select</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <MediaLibraryDialog isOpen={!!isOpen} onClose={() => setOpen(!isOpen)} onSelect={(e) => setThumbnail(e[0].url)} siteId={siteId} />
        </>
    )
}

export default EditorRightSection
