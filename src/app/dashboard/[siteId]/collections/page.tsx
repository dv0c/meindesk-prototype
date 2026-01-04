"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCollections, deleteCollection } from "@/lib/actions/collection-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ArrowLeft, Search, Edit, Trash2, MoreHorizontal, Terminal, Database, Loader2, Folder } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// Import Setup components
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"

export default function CollectionsPage() {
    const params = useParams()
    const router = useRouter()
    const [collections, setCollections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure? This will delete all items in this collection.")) {
            const res = await deleteCollection(id, params.siteId as string)
            if (res.success) {
                toast.success("Collection deleted")
                loadCollections()
            } else {
                toast.error(res.error)
            }
        }
    }

    if (loading) return (
        <div className="fixed inset-0 bg-background flex items-center justify-center font-mono text-foreground">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
                <ScrambleTextOnHover text="ACCESSING SYSTEM..." />
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 bg-background text-foreground font-mono z-50 flex flex-col overflow-hidden">
            <AnimatedNoise opacity={0.05} />

            {/* Header */}
            <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-foreground/10 relative z-10 shrink-0 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center bg-foreground/5">
                        <Database className="w-4 h-4 text-foreground/80" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                            Dynamic Content System
                        </span>
                        <h1 className="text-xl font-bold tracking-tight uppercase font-[var(--font-bebas)]">
                            Collections Registry
                        </h1>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/${params.siteId}`)}
                        className="font-mono text-xs uppercase tracking-widest hover:bg-foreground/5"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        <ScrambleTextOnHover text="DASHBOARD" />
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/new`)}
                        className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs uppercase tracking-widest rounded-none"
                    >
                        <Plus className="mr-2 h-3 w-3" />
                        <ScrambleTextOnHover text="NEW COLLECTION" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="SEARCH COLLECTIONS..."
                                className="pl-10 bg-background/50 border-foreground/20 rounded-none h-10 font-mono text-xs uppercase placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                            />
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                            {collections.length} COLLECTIONS ACTIVE
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-foreground/10 bg-foreground/[0.02] backdrop-blur-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-foreground/10 hover:bg-transparent">
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-10 pl-6">Name</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-10">Description</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-10">Items</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-10">Last Updated</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {collections.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                                <Folder className="w-8 h-8 opacity-20" />
                                                <p className="text-xs font-mono uppercase tracking-widest">No Collections Initialized</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    collections.map((collection) => (
                                        <TableRow
                                            key={collection.id}
                                            className="cursor-pointer border-foreground/5 hover:bg-foreground/5 transition-colors group"
                                            onClick={() => router.push(`/dashboard/${params.siteId}/collections/${collection.id}`)}
                                        >
                                            <TableCell className="font-mono text-xs py-4 text-foreground/80 group-hover:text-foreground transition-colors pl-6 font-bold">
                                                {collection.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs py-4 text-foreground/60">
                                                {collection.description || "N/A"}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs py-4 text-foreground/60">
                                                {collection.items?.length || 0} Records
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider py-4">
                                                {formatDistanceToNow(new Date(collection.updatedAt), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-foreground/10 rounded-none">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-background border-foreground/20 rounded-none">
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/dashboard/${params.siteId}/collections/${collection.id}/settings`)}
                                                            className="font-mono text-xs uppercase focus:bg-foreground/10 focus:text-foreground cursor-pointer"
                                                        >
                                                            <Edit className="mr-2 h-3 w-3" /> Edit Schema
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive font-mono text-xs uppercase focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(collection.id) }}
                                                        >
                                                            <Trash2 className="mr-2 h-3 w-3" /> Delete System
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
            </main>
        </div>
    )
}
