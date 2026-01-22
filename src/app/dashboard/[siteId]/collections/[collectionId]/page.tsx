"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { getItems, deleteItem, getResolvedNames, checkIncomingReferences } from "@/lib/actions/item-actions"
import { getCollection } from "@/lib/actions/collection-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ArrowLeft, Search, Edit, Trash, MoreHorizontal, Loader2, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { DeleteRelationDialog, type Reference, type RelationAction } from "@/components/DeleteRelationDialog"

const ITEMS_PER_PAGE = 10

export default function CollectionItemsPage() {
    const params = useParams()
    const router = useRouter()
    const [collection, setCollection] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({})

    // UI State
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Delete relation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
    const [deleteReferences, setDeleteReferences] = useState<Reference[]>([])
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            const colRes = await getCollection(params.collectionId as string)
            if (colRes.collection) {
                setCollection(colRes.collection)
                const itemsRes = await getItems(params.collectionId as string)
                if (itemsRes.items) {
                    setItems(itemsRes.items)

                    // Resolve Relation IDs
                    const fields = Array.isArray(colRes.collection.fields) ? colRes.collection.fields : []
                    const relationFields = fields.filter((f: any) => f.type === 'relation')
                    const idsToResolve: string[] = []

                    itemsRes.items.forEach((item: any) => {
                        relationFields.forEach((field: any) => {
                            const val = item.data[field.name]
                            if (val) {
                                if (Array.isArray(val)) {
                                    idsToResolve.push(...val)
                                } else {
                                    idsToResolve.push(val)
                                }
                            }
                        })
                    })

                    if (idsToResolve.length > 0) {
                        const uniqueIds = Array.from(new Set(idsToResolve))
                        const namesRes = await getResolvedNames(uniqueIds)
                        if (namesRes.names) {
                            setResolvedNames(namesRes.names)
                        }
                    }
                }
            } else {
                toast.error("Failed to load collection")
                router.push(`/dashboard/${params.siteId}/collections`)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    // Filtering & Pagination
    const filteredItems = useMemo(() => {
        if (!items) return []
        return items.filter(item => {
            // Basic search across all data fields
            const searchStr = JSON.stringify(item.data).toLowerCase()
            return searchStr.includes(searchQuery.toLowerCase())
        })
    }, [items, searchQuery])

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [filteredItems, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])


    const handleDelete = async (id: string) => {
        const item = items.find(i => i.id === id)
        const itemName = item?.data?.title || item?.data?.name || item?.slug || 'this item'

        const refRes = await checkIncomingReferences(id)

        if (refRes.references && refRes.references.length > 0) {
            setDeleteTarget({ id, name: itemName })
            setDeleteReferences(refRes.references)
            setDeleteDialogOpen(true)
        } else {
            if (confirm(`Delete "${itemName}"?`)) {
                const res = await deleteItem(id)
                if (res.success) {
                    toast.success("Item Deleted")
                    setItems(items.filter(i => i.id !== id))
                } else {
                    toast.error("Failed to delete")
                }
            }
        }
    }

    const handleRelationDeleteConfirm = async (action: RelationAction) => {
        if (!deleteTarget || action === 'CANCEL') {
            setDeleteDialogOpen(false)
            return
        }

        setDeleteLoading(true)
        try {
            const res = await deleteItem(deleteTarget.id, action)
            if (res.success) {
                toast.success(
                    action === 'CASCADE'
                        ? `Deleted ${deleteTarget.name} and ${deleteReferences.length} related item(s)`
                        : `Deleted ${deleteTarget.name} and unlinked ${deleteReferences.length} reference(s)`
                )
                // Reload items
                const itemsRes = await getItems(params.collectionId as string)
                if (itemsRes.items) setItems(itemsRes.items)
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

    // Determine fields to show
    const fields = Array.isArray(collection?.fields) ? collection.fields : []
    const displayFields = fields.filter((f: any) =>
        ['text', 'number', 'date', 'select', 'boolean', 'relation'].includes(f.type)
    ).slice(0, 4) || []

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)] w-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/${params.siteId}/collections`)}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{collection?.name}</h2>
                        <p className="text-muted-foreground">
                            {collection?.description || "Manage your collection items"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/settings`)}
                    >
                        <Settings className="mr-2 h-4 w-4" /> Schema
                    </Button>
                    <Button onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/items/new`)}>
                        <Plus className="mr-2 h-4 w-4" /> New Item
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center justify-end">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-background"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border bg-background text-sm shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent border-b">
                                {displayFields.map((field: any) => (
                                    <TableHead key={field.name} className="h-10 text-xs font-medium uppercase min-w-[150px]">
                                        {field.label}
                                    </TableHead>
                                ))}
                                <TableHead className="h-10 text-xs font-medium uppercase">Status</TableHead>
                                <TableHead className="h-10 text-xs font-medium uppercase">Updated</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-right w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={displayFields.length + 3} className="h-24 text-center text-muted-foreground">
                                        No items found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedItems.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="group border-b last:border-0 cursor-pointer hover:bg-muted/40 transition-colors"
                                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/items/${item.id}`)}
                                    >
                                        {displayFields.map((field: any) => (
                                            <TableCell key={field.name} className="py-3 font-medium">
                                                <div className="max-w-[200px] truncate">
                                                    {renderCellContent(item.data[field.name], field.type, resolvedNames)}
                                                </div>
                                            </TableCell>
                                        ))}
                                        <TableCell className="py-3">
                                            <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'} className="h-5 px-2 text-[10px] font-medium rounded-full">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-3 text-xs">
                                            {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
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
                                                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/items/${item.id}`)}
                                                    >
                                                        <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
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

                {/* Pagination */}
                {filteredItems.length > 0 && (
                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="text-xs text-muted-foreground">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
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

            <DeleteRelationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                itemName={deleteTarget?.name || ''}
                references={deleteReferences}
                onConfirm={handleRelationDeleteConfirm}
                loading={deleteLoading}
            />
        </div>
    )
}

function renderCellContent(value: any, type: string, resolvedNames: Record<string, string>) {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic text-xs">null</span>

    switch (type) {
        case 'boolean':
            return value ? <span className="text-green-600 font-medium text-xs">True</span> : <span className="text-muted-foreground text-xs">False</span>
        case 'date':
            return <span className="text-xs">{new Date(value).toLocaleDateString()}</span>
        case 'relation':
            if (Array.isArray(value)) {
                return <span className="text-xs">{value.map(id => resolvedNames[id] || id).join(', ')}</span>
            }
            return <span className="text-xs">{resolvedNames[value] || value}</span>
        case 'image':
            return <span className="text-blue-500 text-xs underline">Image</span>
        default:
            return <span className="text-xs text-foreground/90">{String(value)}</span>
    }
}
