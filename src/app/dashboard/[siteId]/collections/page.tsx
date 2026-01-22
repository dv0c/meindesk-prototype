"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCollections, deleteCollection, checkCollectionReferences } from "@/lib/actions/collection-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash, MoreHorizontal, Loader2, Database, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { DeleteCollectionDialog, type CollectionReference, type CollectionRelationAction } from "@/components/DeleteCollectionDialog"

const ITEMS_PER_PAGE = 10

export default function CollectionsPage() {
    const params = useParams()
    const router = useRouter()
    const [collections, setCollections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
    const [deleteReferences, setDeleteReferences] = useState<CollectionReference[]>([])
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        loadCollections()
    }, [])

    const loadCollections = async () => {
        setLoading(true)
        const res = await getCollections(params.siteId as string)
        if (res.collections) {
            setCollections(res.collections)
        } else {
            toast.error("Failed to load collections")
        }
        setLoading(false)
    }

    const filteredCollections = useMemo(() => {
        return collections.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [collections, searchQuery])

    const totalPages = Math.ceil(filteredCollections.length / ITEMS_PER_PAGE)
    const paginatedCollections = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredCollections.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [filteredCollections, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handleDelete = async (id: string, name: string) => {
        const refRes = await checkCollectionReferences(id)

        if (refRes.references && refRes.references.length > 0) {
            setDeleteTarget({ id, name })
            setDeleteReferences(refRes.references)
            setDeleteDialogOpen(true)
        } else {
            if (confirm(`Delete "${name}"? This will delete all items in this collection.`)) {
                const res = await deleteCollection(id, params.siteId as string)
                if (res.success) {
                    toast.success("Collection deleted")
                    loadCollections()
                } else {
                    toast.error(res.error || "Failed to delete")
                }
            }
        }
    }

    const handleRelationDeleteConfirm = async (action: CollectionRelationAction) => {
        if (!deleteTarget || action === 'CANCEL') {
            setDeleteDialogOpen(false)
            return
        }

        setDeleteLoading(true)
        try {
            const res = await deleteCollection(deleteTarget.id, params.siteId as string, action)
            if (res.success) {
                toast.success(
                    action === 'CASCADE'
                        ? `Deleted ${deleteTarget.name} and all referencing collections`
                        : `Deleted ${deleteTarget.name} and removed relation fields`
                )
                loadCollections()
            } else {
                toast.error(res.error || "Failed to delete")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setDeleteLoading(false)
            setDeleteDialogOpen(false)
            setDeleteTarget(null)
            setDeleteReferences([])
        }
    }

    if (loading && collections.length === 0) return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)] w-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
                    <p className="text-muted-foreground">
                        Manage your dynamic data schemas and content.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => router.push(`/dashboard/${params.siteId}/collections/new`)}>
                        <Plus className="mr-2 h-4 w-4" /> New Collection
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-end">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-background"
                        />
                    </div>
                </div>

                <div className="rounded-md border bg-background text-sm shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="h-10 text-xs font-medium pl-6 w-[250px]">Name</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Description</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Items</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Last Updated</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-right w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCollections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No collections found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCollections.map((collection) => (
                                    <TableRow
                                        key={collection.id}
                                        className="group border-b last:border-0 cursor-pointer hover:bg-muted/40 transition-colors"
                                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/${collection.id}`)}
                                    >
                                        <TableCell className="font-medium py-3 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center border text-muted-foreground">
                                                    <Database className="h-4 w-4" />
                                                </div>
                                                <span className="text-foreground font-medium">{collection.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-3 text-xs">
                                            {collection.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-3 text-xs font-mono">
                                            {collection.items?.length || 0}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-3 text-xs">
                                            {formatDistanceToNow(new Date(collection.updatedAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/${collection.id}/settings`)}
                                                    >
                                                        <Edit className="mr-2 h-3.5 w-3.5" /> Edit Schema
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(collection.id, collection.name) }}
                                                    >
                                                        <Trash className="mr-2 h-3.5 w-3.5" /> Delete
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

                {filteredCollections.length > 0 && (
                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="text-xs text-muted-foreground">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCollections.length)} of {filteredCollections.length}
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

            <DeleteCollectionDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                collectionName={deleteTarget?.name || ''}
                references={deleteReferences}
                onConfirm={handleRelationDeleteConfirm}
                loading={deleteLoading}
            />
        </div>
    )
}
