"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateArticleButton } from "@/components/CreateArticleButton"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useArticle } from "@/hooks/use-article"
import { useTeam } from "@/hooks/useTeam"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MoreHorizontal, Search, Loader2, FileText, Trash, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import ArticleEditor from "@/components/builder/cms/ArticleEditor";
import { DeleteConfirmDialog } from "./builder/cms/dialogs/DeleteConfirmDialog"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const statusColors = {
    PUBLISHED: "default",
    DRAFT: "secondary",
    BANNED: "destructive",
    DELETED: "outline",
}

const ITEMS_PER_PAGE = 10
const TABLE_COLUMN_COUNT = 7

interface ArticleTableProps {
    siteId?: string;
}

export function ArticleTable({ siteId: propSiteId }: ArticleTableProps = {}) {
    const router = useRouter()
    const params = useParams()
    const { articles, articlesListMeta, getArticles, deleteArticle, loading } = useArticle()
    const { team } = useTeam()

    const effectiveSiteId = useMemo(
        () => propSiteId || (params.siteId as string) || team?.id || "",
        [propSiteId, params.siteId, team?.id]
    )

    // Local state
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)

    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!effectiveSiteId) return
        getArticles(effectiveSiteId)
    }, [effectiveSiteId, getArticles])

    // Filter Logic
    const filteredArticles = useMemo(() => {
        if (!articles) return []
        let filtered = articles.filter((article: any) => {
            const matchesSearch =
                article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.slug?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilter === "ALL" || article.status === statusFilter

            return matchesSearch && matchesStatus
        })
        return filtered
    }, [articles, searchQuery, statusFilter])

    // Pagination Logic
    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)
    const paginatedArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [filteredArticles, currentPage])

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter])

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const handleArticleClick = (articleId: string) => {
        if (!effectiveSiteId) return
        if (isDesktop) {
            setSelectedArticleId(articleId)
        } else {
            router.push(`/dashboard/${effectiveSiteId}/projects/website/articles/${articleId}/editor`)
        }
    }

    const handleDelete = async () => {
        const toDelete = deleteId
        if (!effectiveSiteId || !toDelete) return
        setIsDeleting(true)
        try {
            await deleteArticle(effectiveSiteId, toDelete)
            toast.success("Article deleted")
            setDeleteId(null)
            if (selectedArticleId === toDelete) {
                setSelectedArticleId(null)
            }
        } catch {
            // Error toast from useArticle
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading && articles.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
                    <p className="text-muted-foreground">
                        Manage your website articles
                    </p>
                </div>
                <CreateArticleButton siteId={effectiveSiteId || (team?.id as string)} disabled={!effectiveSiteId} />
            </div>

            <div className="space-y-4 w-full">
                {articlesListMeta?.truncated && (
                    <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
                        Showing the {articles.length} most recent articles of {articlesListMeta.total} total.
                        Filters apply only to this loaded set.
                    </p>
                )}
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-background"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-xs">
                                <SelectValue placeholder="Status" />
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
                </div>

                <div className="rounded-md border bg-background text-sm shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="h-10 text-xs font-medium w-[400px]">Article</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Authors</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Status</TableHead>
                                <TableHead className="h-10 text-xs font-medium">SEO</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Time</TableHead>
                                <TableHead className="h-10 text-xs font-medium">Created</TableHead>
                                <TableHead className="h-10 text-xs font-medium text-right w-[60px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedArticles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={TABLE_COLUMN_COUNT} className="h-24 text-center text-muted-foreground">
                                        {(articles?.length ?? 0) > 0
                                            ? "No articles match your search or filters."
                                            : "No articles yet. Create one to get started."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedArticles.map((article: any) => (
                                    <TableRow
                                        key={article.id}
                                        onClick={() => handleArticleClick(article.id)}
                                        className={cn(
                                            "group border-b last:border-0 cursor-pointer hover:bg-muted/40 transition-colors",
                                            selectedArticleId === article.id && "bg-muted/40"
                                        )}
                                    >
                                        <TableCell className="font-medium py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center border overflow-hidden">
                                                    {article.cover ? (
                                                        <Image
                                                            src={article.cover}
                                                            alt={article.title}
                                                            width={32}
                                                            height={32}
                                                            className="object-cover h-full w-full"
                                                        />
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="truncate max-w-[200px] text-foreground font-medium flex items-center gap-1.5">
                                                        {article.title || "Untitled"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px] font-mono">{article.slug}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* Authors Column */}
                                        <TableCell className="py-3">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {article.authors && article.authors.length > 0 ? (
                                                    article.authors.map((author: any) => (
                                                        <div key={author.id} title={author.name} className="relative inline-block border-2 border-background rounded-full">
                                                            {author.image ? (
                                                                <Image
                                                                    src={author.image}
                                                                    alt={author.name}
                                                                    width={24}
                                                                    height={24}
                                                                    className="h-6 w-6 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                                                    {author.name?.[0]?.toUpperCase() || "?"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : article.author ? (
                                                    <div title={article.author.name} className="relative inline-block border-2 border-background rounded-full">
                                                        {article.author.image ? (
                                                            <Image
                                                                src={article.author.image}
                                                                alt={article.author.name}
                                                                width={24}
                                                                height={24}
                                                                className="h-6 w-6 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                                                {article.author.name?.[0]?.toUpperCase() || "?"}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={(statusColors[article.status as keyof typeof statusColors] || "default") as any} className="h-5 px-2 text-[10px] font-medium rounded-full">
                                                {article.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {article.metadata?.seoScore !== undefined ? (
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${article.metadata.seoScore >= 80 ? "bg-green-500" :
                                                        article.metadata.seoScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                                                        }`} />
                                                    <span className="text-xs font-medium">{article.metadata.seoScore}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-3">
                                            {article.metadata?.readingTime ? `${article.metadata.readingTime} min` : "-"}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-3">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right py-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Article actions"
                                                            className="h-8 w-8 text-muted-foreground opacity-100 transition-opacity focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleArticleClick(article.id)}>
                                                            <Edit className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(article.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash className="mr-2 h-3.5 w-3.5" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {
                    filteredArticles.length > 0 && (
                        <div className="flex items-center justify-between px-2 pt-2">
                            <div className="text-xs text-muted-foreground">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length)} of {filteredArticles.length}
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
                    )
                }
            </div >

            <Sheet open={!!selectedArticleId} onOpenChange={(open) => !open && setSelectedArticleId(null)}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-[calc(100vw-40px)] md:max-w-7xl p-0 gap-0 overflow-hidden flex flex-col bg-background z-150 border-l shadow-2xl"
                    style={{ transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}
                >
                    <SheetTitle className="sr-only">Article Editor</SheetTitle>
                    <SheetDescription className="sr-only">Edit article content</SheetDescription>

                    {selectedArticleId && effectiveSiteId && (
                        <div className="flex-1 h-full bg-background relative flex flex-col min-w-0">
                            <ArticleEditor
                                articleId={selectedArticleId}
                                siteId={effectiveSiteId}
                                onClose={() => setSelectedArticleId(null)}
                                onUpdate={() => {
                                    getArticles(effectiveSiteId)
                                }}
                            />
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setDeleteId(null)
                }}
                onConfirm={handleDelete}
                title="Delete Article"
                description="This article will be permanently removed from your site."
                loading={isDeleting}
            />
        </div >
    )
}
