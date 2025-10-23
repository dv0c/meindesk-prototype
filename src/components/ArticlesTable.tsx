"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Eye, Trash, Copy } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import { useArticle } from "@/hooks/use-article"
import { useTeam } from "@/hooks/useTeam"
import { Skeleton } from "./ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

const statusColors = {
    PUBLISHED: "default",
    DRAFT: "secondary",
    BANNED: "destructive",
    DELETED: "outline",
}

const ITEMS_PER_PAGE = 10

export function ArticleTable() {
    const router = useRouter()
    const team = useTeam().team
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const { articles, getArticles, deleteArticle, loading } = useArticle()

    const [deleteTarget, setDeleteTarget] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)


    useEffect(() => {
        if (team) getArticles(team.id)
    }, [team, getArticles])

    const filteredArticles = useMemo(() => {
        if (!articles) return []
        return articles.filter((article: any) => {
            const matchesSearch =
                article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.slug?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "ALL" || article.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [articles, searchQuery, statusFilter])

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

    const confirmDelete = (article: any) => {
        setDeleteTarget(article)
        setIsDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!team || !deleteTarget) return toast.error("Team or article missing.")
        await deleteArticle(team.id, deleteTarget.id)
        getArticles(team.id)
        setIsDialogOpen(false)
        setDeleteTarget(null)
    }


    const handleDuplicate = async (article: any) => {
        if (!team?.id) return toast.error("Team not found.")
        const data = {
            ...article,
            title: `${article.title} (Copy)`,
            slug: `${article.slug}-copy-${Date.now()}`,
        }
        await fetch(`/api/team/${team?.id}/articles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        toast.success("Article duplicated.")
        getArticles(team.id)
    }

    if (loading) {
        return <Skeleton className="h-64 w-full" />
    }


    return (
        <>
            <div className="space-y-4 w-full">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-background border-border"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value)
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="BANNED">Banned</SelectItem>
                            <SelectItem value="DELETED">Deleted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground w-[80px]">
                                    Thumbnail
                                </TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Title</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Slug</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Created</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Updated</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right w-[60px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedArticles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No articles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedArticles.map((article: any) => (
                                    <TableRow
                                        key={article.id}
                                        className="border-border cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={(e) => {
                                            // Prevent triggering when clicking inside the dropdown menu
                                            const target = e.target as HTMLElement
                                            if (target.closest("button") || target.closest("[role='menu']")) return
                                            router.push(`/dashboard/${team?.id}/projects/website/articles/${article.id}/editor`)
                                        }}
                                    >
                                        <TableCell className="py-3">
                                            <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                                {article.cover ? (
                                                    <Image
                                                        src={article.cover}
                                                        alt={article.title}
                                                        width={56}
                                                        height={56}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="text-xs text-muted-foreground">No image</div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-medium py-3 text-sm">{article.title}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground py-3">{article.slug}</TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={statusColors[article.status]} className="text-xs">
                                                {article.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground py-3">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground py-3">
                                            {new Date(article.updateAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell
                                            className="text-right py-3"
                                            onClick={(e) => e.stopPropagation()} // Stop click propagation for menu
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.push(`/dashboard/${team?.id}/projects/website/articles/${article.id}/editor`)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.push(`${team?.url}/article/${article.slug}`)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(article)}>
                                                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => confirmDelete(article)}
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

                {filteredArticles.length > 0 && (
                    <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
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
            {/* Delete confirmation dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The article <strong>{deleteTarget?.title}</strong> will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
