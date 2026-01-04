"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getItems, deleteItem, getResolvedNames } from "@/lib/actions/item-actions"
import { getCollection } from "@/lib/actions/collection-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ArrowLeft, Search, Edit, Trash2, MoreHorizontal, Terminal, Database, Loader2, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Import Setup components
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"

export default function CollectionItemsPage() {
    const params = useParams()
    const router = useRouter()
    const [collection, setCollection] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({})

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
                    const relationFields = colRes.collection.fields.filter((f: any) => f.type === 'relation')
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

    const handleDelete = async (id: string) => {
        if (confirm("Delete this item?")) {
            const res = await deleteItem(id)
            if (res.success) {
                toast.success("Item Deleted")
                setItems(items.filter(i => i.id !== id))
            } else {
                toast.error("Failed to delete")
            }
        }
    }

    // Determine which fields to show in table (first 4 fields including relations)
    const displayFields = collection?.fields?.filter((f: any) =>
        ['text', 'number', 'date', 'select', 'boolean', 'relation'].includes(f.type)
    ).slice(0, 4) || []

    if (loading) return (
        <div className="fixed inset-0 bg-background flex items-center justify-center font-mono text-foreground">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
                <ScrambleTextOnHover text="ACCESSING DATABASE..." />
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
                            Collection Database
                        </span>
                        <h1 className="text-xl font-bold tracking-tight uppercase font-[var(--font-bebas)]">
                            {collection?.name}
                        </h1>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/settings`)}
                        className="font-mono text-xs uppercase tracking-widest hover:bg-foreground/5"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/${params.siteId}/collections`)}
                        className="font-mono text-xs uppercase tracking-widest hover:bg-foreground/5"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        <ScrambleTextOnHover text="BACK" />
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/items/new`)}
                        className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs uppercase tracking-widest rounded-none"
                    >
                        <Plus className="mr-2 h-3 w-3" />
                        <ScrambleTextOnHover text={`NEW ${collection?.name?.slice(0, -1) || "ITEM"}`.toUpperCase()} />
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
                                placeholder="SEARCH QUERY..."
                                className="pl-10 bg-background/50 border-foreground/20 rounded-none h-10 font-mono text-xs uppercase placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                            />
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                            {items.length} RECORDS FOUND
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-foreground/10 bg-foreground/[0.02] backdrop-blur-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-foreground/10 hover:bg-transparent">
                                    {/* Dynamic Headers */}
                                    {displayFields.map((field: any) => (
                                        <TableHead key={field.name} className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-10">
                                            {field.label}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-10">Status</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-10">Last Updated</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={displayFields.length + 3} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                                <Terminal className="w-8 h-8 opacity-20" />
                                                <p className="text-xs font-mono uppercase tracking-widest">No Records Found In Database</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer border-foreground/5 hover:bg-foreground/5 transition-colors group"
                                            onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/items/${item.id}`)}
                                        >
                                            {displayFields.map((field: any) => (
                                                <TableCell key={field.name} className="font-mono text-xs py-4 text-foreground/80 group-hover:text-foreground transition-colors">
                                                    <div className="max-w-[200px] truncate">
                                                        {renderCellContent(item.data[field.name], field.type, resolvedNames)}
                                                    </div>
                                                </TableCell>
                                            ))}
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] rounded-none font-mono tracking-wider border-foreground/20",
                                                    item.status === 'PUBLISHED' ? "bg-foreground/10 text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider py-4">
                                                {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
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
                                                            onClick={() => router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}/items/${item.id}`)}
                                                            className="font-mono text-xs uppercase focus:bg-foreground/10 focus:text-foreground cursor-pointer"
                                                        >
                                                            <Edit className="mr-2 h-3 w-3" /> Edit Record
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive font-mono text-xs uppercase focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                                                        >
                                                            <Trash2 className="mr-2 h-3 w-3" /> Delete Record
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

function renderCellContent(value: any, type: string, resolvedNames: Record<string, string>) {
    if (value === null || value === undefined) return <span className="text-muted-foreground/30 italic text-[10px]">NULL</span>

    switch (type) {
        case 'boolean':
            return value ? <span className="text-green-500 font-bold">TRUE</span> : <span className="text-muted-foreground">FALSE</span>
        case 'date':
            return new Date(value).toLocaleDateString(undefined, { font: 'mono' }) // Force mono if possible or just string
        case 'relation':
            if (Array.isArray(value)) {
                return value.map(id => resolvedNames[id] || id).join(', ')
            }
            return resolvedNames[value] || value
        case 'image':
            return <div className="text-[10px] text-blue-400 underline">IMAGE DATA</div>
        default:
            return String(value)
    }
}
