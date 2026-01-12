import { useState, useEffect, useMemo } from "react"
import { Loader2, Search, FolderOpen, MoreHorizontal, Trash } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateCategoryDialog } from "../dialogs/CreateCategoryDialog"
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog"

interface CMSCategoriesViewProps {
    siteId: string
}

export function CMSCategoriesView({ siteId }: CMSCategoriesViewProps) {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/team/${siteId}/categories`)
            if (res.ok) {
                const data = await res.json()
                setCategories(data || [])
            } else {
                toast.error("Failed to load categories")
            }
        } catch (e) {
            console.error(e)
            toast.error("Error loading categories")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (siteId) fetchCategories()
    }, [siteId])

    const filteredCategories = useMemo(() => {
        return categories.filter((cat: any) =>
            cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.slug?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [categories, searchQuery])

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const res = await fetch(`/api/team/${siteId}/categories/${deleteId}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Category deleted")
                fetchCategories()
            } else {
                toast.error("Failed to delete")
            }
        } catch (e) {
            toast.error("Error deleting category")
        } finally {
            setDeleteId(null)
        }
    }

    if (loading && !categories.length) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <CreateCategoryDialog siteId={siteId} onSuccess={fetchCategories} />
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((cat: any) => (
                                        <TableRow key={cat.id} className="group">
                                            <TableCell>
                                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                            </TableCell>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {cat.published ? "Published" : "Draft"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(cat.id)}>
                                                            <Trash className="h-4 w-4 mr-2" />
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
