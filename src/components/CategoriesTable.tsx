"use client"

import { Edit, MoreHorizontal, Plus, Search, Trash } from 'lucide-react'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from "sonner"

import { useFetch } from "@/hooks/useFetch"
import { useTeam } from "@/hooks/useTeam"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

const ITEMS_PER_PAGE = 10

export function CategoriesTable() {
    const router = useRouter()
    const team = useTeam().team
    const [searchQuery, setSearchQuery] = useState("")
    const [publishedFilter, setPublishedFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)

    const { data: categories, loading, refetch } = useFetch<any[]>(
        team?.id ? `/api/team/${team.id}/categories` : null
    )

    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
    const [deleteTarget, setDeleteTarget] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        slug: "",
        published: true,
    })

    const filteredCategories = useMemo(() => {
        if (!categories) return []
        return categories.filter((category: any) => {
            const matchesSearch =
                category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.slug?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesPublished = publishedFilter === "ALL" ||
                (publishedFilter === "PUBLISHED" && category.published) ||
                (publishedFilter === "UNPUBLISHED" && !category.published)
            return matchesSearch && matchesPublished
        })
    }, [categories, searchQuery, publishedFilter])

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

    const toggleCategorySelection = (categoryId: string) => {
        const newSelected = new Set(selectedCategories)
        if (newSelected.has(categoryId)) {
            newSelected.delete(categoryId)
        } else {
            newSelected.add(categoryId)
        }
        setSelectedCategories(newSelected)
    }

    const toggleSelectAll = () => {
        const allIds = new Set(paginatedCategories.map((c: any) => c.id))
        if (selectedCategories.size === paginatedCategories.length && paginatedCategories.length > 0) {
            setSelectedCategories(new Set())
        } else {
            setSelectedCategories(allIds)
        }
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const handleCreateCategory = async () => {
        if (!team?.id) return toast.error("Team not found")
        if (!formData.name) return toast.error("Category name is required")

        try {
            const response = await fetch(`/api/team/${team.id}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    slug: formData.slug || generateSlug(formData.name),
                    published: formData.published,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create category")
            }

            toast.success("Category created successfully")
            setIsCreateDialogOpen(false)
            setFormData({ name: "", description: "", slug: "", published: true })
            refetch()
        } catch (error: any) {
            toast.error(error.message || "Failed to create category")
        }
    }

    const handleEditCategory = async () => {
        if (!team?.id || !editingCategory) return toast.error("Team or category not found")

        try {
            const response = await fetch(`/api/team/${team.id}/categories/${editingCategory.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    slug: formData.slug,
                    published: formData.published,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update category")
            }

            toast.success("Category updated successfully")
            setIsEditDialogOpen(false)
            setEditingCategory(null)
            setFormData({ name: "", description: "", slug: "", published: true })
            refetch()
        } catch (error: any) {
            toast.error(error.message || "Failed to update category")
        }
    }

    const confirmDelete = (category: any) => {
        setDeleteTarget(category)
        setIsDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!team || !deleteTarget) return toast.error("Team or category missing")

        try {
            const response = await fetch(`/api/team/${team.id}/categories/${deleteTarget.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to delete category")
            }

            toast.success("Category deleted successfully")
            refetch()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category")
        }
        setIsDialogOpen(false)
        setDeleteTarget(null)
    }

    const openEditDialog = (category: any) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            slug: category.slug,
            published: category.published,
        })
        setIsEditDialogOpen(true)
    }

    const isAllSelected = selectedCategories.size === paginatedCategories.length && paginatedCategories.length > 0

    return (
        <>
            <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-background border-border"
                            />
                        </div>
                        <Select
                            value={publishedFilter}
                            onValueChange={(value) => {
                                setPublishedFilter(value)
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9 gap-2">
                        <Plus className="h-4 w-4" />
                        New Category
                    </Button>
                </div>

                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground w-[50px]">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all categories"
                                    />
                                </TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Name</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Slug</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Description</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Created</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right w-[60px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <TableRow key={idx} className="border-border">
                                        <TableCell className="py-3">
                                            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                                        </TableCell>
                                        <TableCell className="py-3 text-right">
                                            <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCategories.map((category: any) => (
                                    <TableRow
                                        key={category.id}
                                        className={`border-border transition-all duration-200 ${selectedCategories.has(category.id) ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                                    >
                                        <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedCategories.has(category.id)}
                                                onCheckedChange={() => toggleCategorySelection(category.id)}
                                                aria-label={`Select ${category.name}`}
                                            />
                                        </TableCell>

                                        <TableCell className="font-medium py-3 text-sm">
                                            {category.name}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground py-3">{category.slug}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground py-3 max-w-xs truncate">
                                            {category.description || "-"}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={category.published ? "default" : "secondary"} className="text-xs">
                                                {category.published ? "Published" : "Unpublished"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground py-3">
                                            {new Date(category.createdAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell
                                            className="text-right py-3"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => confirmDelete(category)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {filteredCategories.length > 0 && (
                    <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} categories
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-8"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>
                            Add a new category to organize your articles
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value })
                                    if (!formData.slug) {
                                        setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })
                                    }
                                }}
                                placeholder="Technology"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="technology"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Category description..."
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="published"
                                checked={formData.published}
                                onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })}
                            />
                            <Label htmlFor="published" className="cursor-pointer">Published</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCategory}>Create Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update category details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Technology"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-slug">Slug *</Label>
                            <Input
                                id="edit-slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="technology"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Category description..."
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center  space-x-2">
                            <Checkbox
                                id="edit-published"
                                checked={formData.published}
                                onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })}
                            />
                            <Label htmlFor="edit-published" className="cursor-pointer">Published</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditCategory}>Update Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The category <strong>{deleteTarget?.name}</strong> will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
