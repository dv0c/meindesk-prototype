import { CreateCollectionDialog } from "../dialogs/CreateCollectionDialog"
import { EditCollectionDialog } from "../dialogs/EditCollectionDialog"
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog"
import { Edit } from "lucide-react"

interface CMSCollectionsViewProps {
    siteId: string
}

export function CMSCollectionsView({ siteId }: CMSCollectionsViewProps) {
    const [collections, setCollections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Dialog states
    const [editCollection, setEditCollection] = useState<any>(null)
    const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null)

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

    if (loading && !collections.length) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search collections..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <CreateCollectionDialog siteId={siteId} onSuccess={fetchCollections} />
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
                                        <TableRow key={col.id} className="group">
                                            <TableCell>
                                                <Database className="h-4 w-4 text-muted-foreground" />
                                            </TableCell>
                                            <TableCell className="font-medium">{col.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{col.slug}</TableCell>
                                            <TableCell className="text-sm">
                                                {(col.fields as any[])?.length || 0} fields
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditCollection(col)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteCollectionId(col.id)}>
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

            {/* Edit Dialog */}
            {editCollection && (
                <EditCollectionDialog
                    open={!!editCollection}
                    onOpenChange={(open) => !open && setEditCollection(null)}
                    collection={editCollection}
                    onSuccess={fetchCollections}
                />
            )}

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

