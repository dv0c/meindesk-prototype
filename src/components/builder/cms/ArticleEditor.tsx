"use client"

import { SerializedEditorState } from "lexical"
import { useEffect, useMemo, useRef, useState } from "react"

import { EditorProvider, EditorToolbar, EditorContent } from "@/components/blocks/editor-x/editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { useArticle } from "@/hooks/use-article"
import { useMediaQuery } from "@/hooks/use-media-query"
import EditorRightSection from "./EditorRightSection"
import { ArrowLeft, ChevronDown, PanelRight, Save, X, Maximize2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { $generateNodesFromDOM } from "@lexical/html"
import { $getRoot, $insertNodes } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

function HtmlLoaderPlugin({ html }: { html: string }) {
    const [editor] = useLexicalComposerContext()
    const loadedRef = useRef(false)

    useEffect(() => {
        if (!html || loadedRef.current) return

        editor.update(() => {
            const parser = new DOMParser()
            const dom = parser.parseFromString(html, "text/html")
            const nodes = $generateNodesFromDOM(editor, dom)
            const root = $getRoot()
            root.clear()
            $insertNodes(nodes)
            loadedRef.current = true
        })
    }, [editor, html])

    return null
}

interface ArticleEditorProps {
    articleId: string
    siteId: string
    onClose?: () => void
}

export default function ArticleEditor({ articleId, siteId, onClose }: ArticleEditorProps) {
    const [title, setTitle] = useState("")
    const [editorState, setEditorState] = useState<SerializedEditorState>()
    const [html, setHtml] = useState("")
    const [slug, setSlug] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [thumbnail, setThumbnail] = useState("")
    const [categories, setCategories] = useState<string[]>([])
    const [seo, setSeo] = useState<{ metaTitle: string; metaDescription: string; ogImage: string }>({
        metaTitle: "",
        metaDescription: "",
        ogImage: ""
    })
    const [loaded, setLoaded] = useState(false)
    const [showSidebar, setShowSidebar] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const titleRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isDesktop) {
            setShowSidebar(true)
        }
    }, [isDesktop])

    const { article, getArticle, updateArticle, loading } = useArticle()

    useEffect(() => {
        if (!articleId || !siteId) return
        getArticle(siteId, articleId)
    }, [articleId, siteId, getArticle])

    useEffect(() => {
        if (!article || (loaded && article.id === articleId)) return
        // Reset state when article changes or initially loads
        setTitle(article.title || "")
        const content = article.content
        const hasContent = content && Object.keys(content).length > 0 && content.root
        setEditorState(hasContent ? content : undefined)
        setHtml(article.html || "") // Ensure html is set from article
        setSlug(article.slug || "")
        setExcerpt(article.excerpt || "")
        setCategories(article.categories || [])
        setLoaded(true)
        setThumbnail(article.cover || "")
        // Load SEO from metadata
        const articleMeta = article.metadata as any
        if (articleMeta?.seo) {
            setSeo({
                metaTitle: articleMeta.seo.metaTitle || "",
                metaDescription: articleMeta.seo.metaDescription || "",
                ogImage: articleMeta.seo.ogImage || ""
            })
        }
    }, [article, loaded, articleId])

    // Auto-resize title on load and when title changes
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto'
            titleRef.current.style.height = titleRef.current.scrollHeight + 'px'
        }
    }, [title])

    const handleSave = async () => {
        if (!articleId || !siteId) return
        try {
            await updateArticle(siteId, articleId, {
                title,
                content: editorState,
                html,
                slug,
                excerpt,
                cover: thumbnail,
                categories,
                metadata: {
                    ...((article?.metadata as any) || {}),
                    seo,
                    readingTime: Math.ceil((html?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0) / 200),
                    seoScore: (() => {
                        let score = 0;
                        if (title.length > 5 && title.length <= 60) score += 30; // Optimal title length
                        else if (title.length > 0) score += 10;

                        const desc = seo.metaDescription || excerpt;
                        if (desc.length > 10 && desc.length <= 160) score += 30; // Optimal description length
                        else if (desc.length > 0) score += 10;

                        if (thumbnail) score += 20; // Has cover image

                        const wordCount = (html?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0);
                        if (wordCount > 300) score += 20; // Good content length
                        else if (wordCount > 100) score += 10;

                        return score;
                    })()
                }
            })
            // toast.success("Saved!")
        } catch (error) {
            toast.error("Failed to save")
        }
    }

    const handleStatus = async ({ status }: { status: string }) => {
        if (!articleId || !siteId) return
        try {
            await updateArticle(siteId, articleId, { status })
            toast.success(`Status: ${status}`)
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const unsavedChanges = useMemo(() => {
        if (!article) return false
        const titleChanged = title !== (article.title || "")
        const contentChanged = JSON.stringify(editorState) !== JSON.stringify(article.content || "")
        const slugChanged = slug !== (article.slug || "")
        const excerptChanged = excerpt !== (article.excerpt || "")
        const thumbnailChanged = thumbnail !== (article.cover || "")
        const categoriesChanged = JSON.stringify(categories) !== JSON.stringify(article.categories || [])
        // If html is loaded from article.html but editorState was empty, contentChanged might be tricky.
        // But usually saving will update both.
        return titleChanged || contentChanged || slugChanged || excerptChanged || thumbnailChanged || categoriesChanged
    }, [title, editorState, slug, excerpt, article, thumbnail, categories])

    if (!loaded && loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        )
    }

    if (!article) return null

    return (
        <EditorProvider
            editorSerializedState={editorState}
            onSerializedChange={(value) => setEditorState(value)}
            onHtmlChange={(value) => setHtml(value)}
        >
            {!editorState && article.html && (
                <HtmlLoaderPlugin html={article.html} />
            )}
            <div className="h-full flex flex-col bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 h-12 shrink-0 flex items-center justify-between px-4 border-b bg-background">
                    <div className="flex items-center gap-3">
                        {onClose && (
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <span className="text-sm font-medium truncate max-w-[200px] hidden sm:block">
                            {title || "Untitled"}
                        </span>
                        {unsavedChanges && (
                            <Badge variant="outline" className="text-orange-500 border-orange-500/50 text-xs">
                                Unsaved
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/${siteId}/projects/website/articles/${articleId}/editor`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                                    <span className={`h-2 w-2 rounded-full ${article?.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-yellow-500'
                                        }`} />
                                    {article?.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleStatus({ status: 'PUBLISHED' })}>
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                                    Published
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatus({ status: 'DRAFT' })}>
                                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                                    Draft
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-4 w-px bg-border" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={`h-8 w-8 p-0 ${showSidebar ? 'bg-accent' : ''}`}
                        >
                            <PanelRight className="h-4 w-4" />
                        </Button>

                        <Button
                            onClick={handleSave}
                            disabled={loading || !unsavedChanges}
                            size="sm"
                            className="h-8 px-3 gap-1.5"
                            variant={unsavedChanges ? "default" : "secondary"}
                        >
                            {loading ? (
                                <Spinner className="h-3.5 w-3.5" />
                            ) : (
                                <Save className="h-3.5 w-3.5" />
                            )}
                            Save
                        </Button>
                    </div>
                </header>

                {/* Toolbar */}
                <div className="sticky top-12 z-40 shrink-0 border-b bg-background h-12 flex items-center">
                    <EditorToolbar />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Area */}
                    <div className="flex-1 overflow-y-auto relative">
                        {/* Title */}
                        <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-8 pb-4 bg-background">
                            <div className="max-w-3xl mx-auto">
                                <textarea
                                    ref={titleRef}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Article title"
                                    rows={1}
                                    className="w-full bg-transparent text-3xl font-bold tracking-tight placeholder:text-muted-foreground/40 focus:outline-none resize-none overflow-hidden"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            // Focus the editor
                                            const editor = document.querySelector('.ContentEditable__root') as HTMLElement
                                            if (editor) editor.focus()
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-background pb-32 px-4 sm:px-6 md:px-8">
                            <div className="max-w-3xl mx-auto">
                                <EditorContent siteId={siteId} />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar */}
                    <aside className={`hidden md:flex w-80 border-l bg-background flex-col z-[45] transition-all duration-300 ${showSidebar ? 'mr-0' : '-mr-80'}`}>
                        <div className="flex-1 overflow-y-auto p-4">
                            <EditorRightSection
                                setThumbnail={setThumbnail}
                                thumbnail={thumbnail}
                                article={article}
                                slug={slug}
                                setSlug={setSlug}
                                excerpt={excerpt}
                                setExcerpt={setExcerpt}
                                categories={categories}
                                setCategories={setCategories}
                                title={title}
                                seo={seo}
                                setSeo={setSeo}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </EditorProvider>
    )
}
