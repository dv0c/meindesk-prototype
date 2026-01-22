"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useArticle } from "@/hooks/use-article"
import { useTeam } from "@/hooks/useTeam"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MoreHorizontal, Plus, Search, Loader2, FileText, Trash, Edit, Copy } from "lucide-react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import ArticleEditor from "@/components/builder/cms/ArticleEditor";
import { DeleteConfirmDialog } from "./builder/cms/dialogs/DeleteConfirmDialog"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const statusColors = {
    PUBLISHED: "default",
    DRAFT: "secondary",
    BANNED: "destructive",
    DELETED: "outline",
}

interface ArticleTableProps {
    siteId?: string;
}

export function ArticleTable({ siteId: propSiteId }: ArticleTableProps = {}) {
    const router = useRouter()
    const params = useParams()
    const siteId = propSiteId || (params.siteId as string)
    const { articles, getArticles, deleteArticle, loading } = useArticle()
    const { team } = useTeam()

    // Local state for search/filter
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        if (team) getArticles(team.id)
    }, [team, getArticles])

    const filteredArticles = useMemo(() => {
        if (!articles) return []
        return articles.filter((article: any) => {
            const matchesSearch =
                article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.slug?.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesSearch
        })
    }, [articles, searchQuery])

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const handleArticleClick = (articleId: string) => {
        if (isDesktop) {
            setSelectedArticleId(articleId)
        } else {
            router.push(`/dashboard/${team?.id}/projects/website/articles/${articleId}/editor`)
        }
    }


    const handleDelete = async () => {
        if (!team || !deleteId) return
        await deleteArticle(team.id, deleteId)
        toast.success("Article deleted")
        setDeleteId(null)
        if (selectedArticleId === deleteId) {
            setSelectedArticleId(null)
        }
        getArticles(team.id)
    }

    return (
        <div className="flex h-full w-full flex-col bg-background/50">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 md:px-0 py-4 border-b bg-background/95 backdrop-blur z-10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search articles..."
                            className="pl-9 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="py-6 md:py-6">
                    <div className="rounded-md border bg-background text-sm shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-[400px]">Article</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && articles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex justify-center items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredArticles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No articles found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredArticles.map((article: any) => (
                                        <TableRow
                                            key={article.id}
                                            onClick={() => handleArticleClick(article.id)}
                                            className={cn(
                                                "cursor-pointer transition-colors hover:bg-muted/40",
                                                selectedArticleId === article.id && "bg-muted/40 border-l-2 border-l-primary"
                                            )}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 relative shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center text-muted-foreground">
                                                        {article.cover ? (
                                                            <Image
                                                                src={article.cover}
                                                                alt={article.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <FileText className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="truncate max-w-[200px] font-medium text-foreground">{article.title || "Untitled"}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{article.slug}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={(statusColors[article.status as keyof typeof statusColors] || "default") as any} className="h-5 px-2 text-[10px] font-medium rounded-full">
                                                    {article.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(article.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
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
                </div>
            </ScrollArea>

            <Sheet open={!!selectedArticleId} onOpenChange={(open) => !open && setSelectedArticleId(null)}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-[calc(100vw-40px)] md:max-w-7xl p-0 gap-0 overflow-hidden flex flex-col bg-background z-[150] border-l shadow-2xl"
                    style={{ transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}
                >
                    <SheetTitle className="sr-only">Article Editor</SheetTitle>
                    <SheetDescription className="sr-only">Edit article content</SheetDescription>

                    {selectedArticleId && (
                        <div className="flex-1 h-full bg-background relative flex flex-col min-w-0">
                            <ArticleEditor
                                articleId={selectedArticleId}
                                siteId={siteId || (team?.id as string)}
                                onClose={() => setSelectedArticleId(null)}
                            />
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Article"
            />
        </div>
    )
}
