"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Search, Database, Edit, Trash, Plus } from "lucide-react"
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
import { getCollections, deleteCollection } from "@/lib/actions/collection-actions"

import { DeleteConfirmDialog } from "./builder/cms/dialogs/DeleteConfirmDialog"
import { CollectionsEditor } from "./CollectionsEditor"

interface CollectionsViewProps {
    siteId: string
}

export function CollectionsView({ siteId }: CollectionsViewProps) {
    const [collections, setCollections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Dialog states
    const [editCollection, setEditCollection] = useState<any>(null)
    const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null)

    // Mode: list, create, edit
    const [mode, setMode] = useState<"list" | "create" | "edit">("list")

    const fetchCollections = async () => {
        try {
            setLoading(true)
            const res = await getCollections(siteId)
            if (res.collections) {
                setCollections(res.collections)
            } else {
                toast.error("Failed to load collections")
            }
        } catch (e) {
            console.error(e)
            toast.error("Error loading collections")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (siteId) fetchCollections()
    }, [siteId])

    const filteredCollections = useMemo(() => {
        return collections.filter((col: any) =>
            col.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            col.slug?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [collections, searchQuery])

    const handleDelete = async () => {
        if (!deleteCollectionId) return
        try {
            const res = await deleteCollection(deleteCollectionId, siteId)
            if (res.success) {
                toast.success("Collection deleted")
                fetchCollections()
            } else {
                toast.error(res.error || "Failed to delete")
            }
        } catch (e) {
            toast.error("Error deleting collection")
        } finally {
            setDeleteCollectionId(null)
        }
    }

    const handleSuccess = () => {
        fetchCollections()
        setMode("list")
        setEditCollection(null)
    }

    if (mode === "create") {
        return (
            <CollectionsEditor
                siteId={siteId}
                onBack={() => setMode("list")}
                onSuccess={handleSuccess}
            />
        )
    }

    if (mode === "edit" && editCollection) {
        return (
            <CollectionsEditor
                siteId={siteId}
                initialData={editCollection}
                onBack={() => {
                    setMode("list")
                    setEditCollection(null)
                }}
                onSuccess={handleSuccess}
            />
        )
    }

    if (loading && !collections.length) {
        return <div className="flex items-center justify-center h-full w-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="flex flex-col h-full bg-background dark:bg-zinc-950">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-background/95 backdrop-blur z-10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search collections..."
                            className="pl-9 bg-background h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={() => setMode("create")} className="h-9">
                    <Plus className="h-4 w-4 mr-2" />
                    New Collection
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">
                    <div className="rounded-md border bg-background">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:bg-transparent border-b">
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Fields</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCollections.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No collections found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCollections.map((col: any) => (
                                        <TableRow key={col.id} className="group hover:bg-muted/40 cursor-pointer border-b last:border-0" onClick={() => {
                                            setEditCollection(col)
                                            setMode("edit")
                                        }}>
                                            <TableCell>
                                                <Database className="h-4 w-4 text-muted-foreground" />
                                            </TableCell>
                                            <TableCell className="font-medium">{col.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-mono">{col.slug}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {(col.fields as any[])?.length || 0} fields
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                                        setEditCollection(col)
                                                        setMode("edit")
                                                    }}>
                                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteCollectionId(col.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </ScrollArea>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={!!deleteCollectionId}
                onOpenChange={(open) => !open && setDeleteCollectionId(null)}
                onConfirm={handleDelete}
                title="Delete Collection"
                description="Are you sure you want to delete this collection? All items within this collection will also be deleted. This action cannot be undone."
            />
        </div>
    )
}
