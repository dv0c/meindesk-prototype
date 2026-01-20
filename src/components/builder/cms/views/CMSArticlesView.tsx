"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useArticle } from "@/hooks/use-article"
import { useTeam } from "@/hooks/useTeam"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MoreHorizontal, Plus, Search, Trash } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import ArticleEditor from "../ArticleEditor";
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"

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
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
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

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const handleArticleClick = (articleId: string) => {
        if (isDesktop) {
            setSelectedArticleId(articleId)
        } else {
            router.push(`/dashboard/${team?.id}/projects/website/articles/${articleId}/editor`)
        }
    }

    const handleCreateArticle = async () => {
        if (!team) return
        try {
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
                const newArticle = await res.json()
                toast.success("Article created")
                await getArticles(team.id)
                setSelectedArticleId(newArticle.id) // Select the new article immediately
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
        if (selectedArticleId === deleteId) {
            setSelectedArticleId(null)
        }
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* List View - Always full width now, editor opens as sheet */}
            <div className="flex flex-col h-full w-full bg-background">
                <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search articles..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button size="icon" variant="ghost" className="ml-2" onClick={handleCreateArticle}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {filteredArticles.length === 0 ? (
                            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                                No articles found.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredArticles.map((article: any) => (
                                    <div
                                        key={article.id}
                                        onClick={() => handleArticleClick(article.id)}
                                        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${selectedArticleId === article.id ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted border-transparent'}`}
                                    >
                                        <div className="h-10 w-10 relative shrink-0 overflow-hidden rounded-md bg-muted border">
                                            {article.cover ? (
                                                <Image
                                                    src={article.cover}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                                    <span className="text-[10px] text-muted-foreground">Img</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm truncate">{article.title || "Untitled"}</span>
                                                <Badge variant={(statusColors[article.status as keyof typeof statusColors] || "default") as any} className="text-[10px] px-1.5 h-5">
                                                    {article.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <span className="text-xs text-muted-foreground truncate" title={article.slug}>{article.slug}</span>
                                                <span className="text-[10px] text-muted-foreground">{new Date(article.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteId(article.id)
                                            }}
                                        >
                                            <Trash className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <Sheet open={!!selectedArticleId} onOpenChange={(open) => !open && setSelectedArticleId(null)}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-[calc(100vw-40px)] md:max-w-7xl p-0 gap-0 overflow-hidden flex flex-col bg-background z-[150] border-l"
                >
                    <SheetTitle className="sr-only">Article Editor</SheetTitle>
                    <SheetDescription className="sr-only">Edit article content</SheetDescription>

                    {selectedArticleId && (
                        <div className="flex-1 h-full bg-background relative flex flex-col min-w-0">
                            <ArticleEditor
                                articleId={selectedArticleId}
                                siteId={siteId}
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
