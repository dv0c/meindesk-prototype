"use client"

import { useArticle } from "@/hooks/use-article"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Search, MoreHorizontal, Edit, Trash, Copy, Eye } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { useTeam } from "@/hooks/useTeam"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog"

interface CMSArticlesViewProps {
    siteId: string
}

const statusColors = {
    PUBLISHED: "default",
    DRAFT: "secondary",
    BANNED: "destructive",
    DELETED: "outline",
}

export function CMSArticlesView({ siteId }: CMSArticlesViewProps) {
    const router = useRouter()
    const { articles, getArticles, deleteArticle, loading } = useArticle()
    const { team } = useTeam()

    // Local state for search/filter
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
    const [deleteId, setDeleteId] = useState<string | null>(null)

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

    const handleCreateArticle = async () => {
        if (!team) return
        try {
            // We can use the existing CreateArticleButton logic or redirect.
            // For now, let's create a temp blank article or repurpose the existing endpoint if we want "New Article" 
            // to happen instantly. 
            // Usually it's better to show a dialog or just use the existing flow.
            // Given the requirement "without moving out of the builder", 
            // we should probably hit the API to create one and then refresh.

            const res = await fetch(`/api/team/${team.id}/articles`, {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Untitled Article',
                    slug: `untitled-article-${Date.now()}`,
                    content: {},
                    status: 'DRAFT'
                })
            })

            if (res.ok) {
                toast.success("Article created")
                getArticles(team.id)
            } else {
                toast.error("Failed to create article")
            }

        } catch (e) {
            toast.error("Error creating article")
        }
    }

    const handleDelete = async () => {
        if (!team || !deleteId) return
        await deleteArticle(team.id, deleteId)
        toast.success("Article deleted")
        setDeleteId(null)
    }

    const handleEdit = (articleId: string) => {
        // Redirect to the article editor full page
        if (!team) return
        // We probably want to open this in a new tab if we want to "keep" the builder state, 
        // OR navigating away means we lose builder state?
        // User said: "editting article will open the real builder we already have"
        // If they navigate away, they lose builder context unless we persist it.
        // Assuming standard link navigation is fine.
        router.push(`/dashboard/${team.id}/projects/website/articles/${articleId}/editor`)
    }

    if (loading && !articles?.length) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search articles..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleCreateArticle}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Article</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredArticles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No articles found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredArticles.map((article: any) => (
                                        <TableRow key={article.id} className="group">
                                            <TableCell>
                                                <div className="h-10 w-10 relative overflow-hidden rounded-md bg-muted">
                                                    {article.cover && (
                                                        <Image
                                                            src={article.cover}
                                                            alt={article.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium truncate max-w-[300px]">{article.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[300px]">{article.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusColors[article.status] as any || "default"}>
                                                    {article.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(article.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(article.id)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => window.open(`${team?.url}/article/${article.slug}`, '_blank')}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Live
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(article.id)}>
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
                title="Delete Article"
            />
        </div>
    )
}
