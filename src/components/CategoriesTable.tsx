"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Edit, Trash, MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFetch } from "@/hooks/useFetch"
import { useTeam } from "@/hooks/useTeam"
import { CreateCategoryDialog } from "./builder/cms/dialogs/CreateCategoryDialog"
import { EditCategoryDialog, type EditCategoryRow } from "./builder/cms/dialogs/EditCategoryDialog"
import { DeleteConfirmDialog } from "./builder/cms/dialogs/DeleteConfirmDialog"
import { useParams } from "next/navigation"

const ITEMS_PER_PAGE = 10
const TABLE_COLUMN_COUNT = 4

interface CategoriesTableProps {
    siteId?: string
}

export function CategoriesTable({ siteId: propSiteId }: CategoriesTableProps = {}) {
    const params = useParams()
    const { team } = useTeam()
    const siteId = propSiteId || (params.siteId as string)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const { data: categories, loading, refetch } = useFetch<any[]>(
        (siteId || team?.id) ? `/api/team/${siteId || team?.id}/categories` : null
    )

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editCategory, setEditCategory] = useState<EditCategoryRow | null>(null)
    const [editOpen, setEditOpen] = useState(false)

    const filteredCategories = useMemo(() => {
        if (!categories) return []
        return categories.filter((cat: any) =>
            cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.slug?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [categories, searchQuery])

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [filteredCategories, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handleDelete = async () => {
        if (!deleteId || (!siteId && !team?.id)) return
        try {
            const res = await fetch(`/api/team/${siteId || team?.id}/categories/${deleteId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Category deleted")
                refetch()
            } else {
                const err = await res.json().catch(() => ({}))
                toast.error(err.error || "Failed to delete category")
            }
        } catch (e) {
            toast.error("Error deleting category")
        } finally {
            setDeleteId(null)
        }
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                    <p className="text-muted-foreground">
                        Manage your website categories
                    </p>
                </div>
                <CreateCategoryDialog siteId={(siteId || team?.id) as string} onSuccess={refetch} />
            </div>

            <div className="space-y-4 w-full">
                {/* Toolbar matching ArticlesTable: Right-aligned search */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-background"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-md border bg-background text-sm shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="h-10 text-xs font-medium w-[400px]">Name</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Slug</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Status</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-right w-[60px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={TABLE_COLUMN_COUNT} className="h-24 text-center">
                                        <div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={TABLE_COLUMN_COUNT} className="h-24 text-center text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCategories.map((cat: any) => (
                                    <TableRow
                                        key={cat.id}
                                        className="group border-b last:border-0 hover:bg-muted/40 transition-colors"
                                    >
                                        <TableCell className="font-medium py-3">
                                            {cat.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm font-mono py-3">
                                            {cat.slug}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={cat.published ? "default" : "secondary"} className="h-5 px-2 text-[10px] font-medium rounded-full">
                                                {cat.published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Category actions"
                                                        className="h-8 w-8 text-muted-foreground opacity-100 transition-opacity focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditCategory({
                                                                id: cat.id,
                                                                name: cat.name,
                                                                slug: cat.slug,
                                                                description: cat.description,
                                                                published: cat.published,
                                                                metadata: cat.metadata,
                                                            })
                                                            setEditOpen(true)
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeleteId(cat.id)} className="text-destructive focus:text-destructive">
                                                        <Trash className="mr-2 h-3.5 w-3.5" />
                                                        Delete
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

                {/* Pagination */}
                {filteredCategories.length > 0 && (
                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="text-xs text-muted-foreground">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length)} of {filteredCategories.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <EditCategoryDialog
                siteId={(siteId || team?.id) as string}
                category={editCategory}
                open={editOpen && !!editCategory}
                onOpenChange={(o) => {
                    setEditOpen(o)
                    if (!o) setEditCategory(null)
                }}
                onSuccess={refetch}
            />

            <DeleteConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete category"
                description="This category will be removed from all articles that use it, then deleted. This cannot be undone."
            />
        </div>
    )
}
