"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Edit, Trash, MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { DeleteConfirmDialog } from "./builder/cms/dialogs/DeleteConfirmDialog"
import { useParams } from "next/navigation"

interface CategoriesTableProps {
    siteId?: string
}

export function CategoriesTable({ siteId: propSiteId }: CategoriesTableProps = {}) {
    const params = useParams()
    const { team } = useTeam()
    const siteId = propSiteId || (params.siteId as string) // Prefer props or params
    const [searchQuery, setSearchQuery] = useState("")

    // We can fetch using the hook, but for consistency with CMS view we might want to ensure re-fetch triggers
    const { data: categories, loading, refetch } = useFetch<any[]>(
        (siteId || team?.id) ? `/api/team/${siteId || team?.id}/categories` : null
    )

    const [deleteId, setDeleteId] = useState<string | null>(null)

    const filteredCategories = useMemo(() => {
        if (!categories) return []
        return categories.filter((cat: any) =>
            cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.slug?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [categories, searchQuery])

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
                toast.error("Failed to delete category")
            }
        } catch (e) {
            toast.error("Error deleting category")
        } finally {
            setDeleteId(null)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background dark:bg-zinc-950">
            <div className="p-6 py-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-9 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                {/* Re-use the existing CreateCategoryDialog logic but it needs siteId */}
                <CreateCategoryDialog siteId={(siteId || team?.id) as string} onSuccess={refetch} />
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">
                    <div className="rounded-md border bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((cat: any) => (
                                        <TableRow key={cat.id} className="group hover:bg-muted/40">
                                            <TableCell>
                                                {/* Icon placeholder if any */}
                                            </TableCell>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-mono">{cat.slug}</TableCell>
                                            <TableCell>
                                                <Badge variant={cat.published ? "default" : "secondary"} className="text-[10px] px-2 h-5 rounded-full">
                                                    {cat.published ? "Published" : "Draft"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
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
                </div>
            </ScrollArea>

            <DeleteConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Category"
            />
        </div>
    )
}
