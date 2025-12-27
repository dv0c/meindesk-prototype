"use client"

import { SerializedEditorState } from "lexical"
import { use, useEffect, useMemo, useRef, useState } from "react"

import { EditorProvider, EditorToolbar, EditorContent } from "@/components/blocks/editor-x/editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { useArticle } from "@/hooks/use-article"
import { useMediaQuery } from "@/hooks/use-media-query"
import RightSection from "./_comps/RightSection"
import { ArrowLeft, ChevronDown, PanelRight, Save, X } from "lucide-react"
import { toast } from "sonner"

interface EditorPageProps {
  params: {
    id: string
    siteId: string
  }
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id: articleId, siteId } = use(params as any) as any

  const [title, setTitle] = useState("")
  const [editorState, setEditorState] = useState<SerializedEditorState>()
  const [html, setHtml] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [categories, setCategories] = useState<string[]>([])
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
    if (!article || loaded) return
    setTitle(article.title || "")
    setEditorState(article.content || "")
    setSlug(article.slug || "")
    setExcerpt(article.excerpt || "")
    setCategories(article.categories || [])
    setLoaded(true)
    setThumbnail(article.cover || "")
  }, [article, loaded])

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
        categories
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
    return titleChanged || contentChanged || slugChanged || excerptChanged || thumbnailChanged || categoriesChanged
  }, [title, editorState, slug, excerpt, article, thumbnail, categories])

  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <EditorProvider
      editorSerializedState={editorState}
      onSerializedChange={(value) => setEditorState(value)}
      onHtmlChange={(value) => setHtml(value)}
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 h-12 shrink-0 flex items-center justify-between px-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => history.back()}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-[300px] hidden sm:block">
              {title || "Untitled"}
            </span>
            {unsavedChanges && (
              <Badge variant="outline" className="text-orange-500 border-orange-500/50 text-xs">
                Unsaved
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
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
        <div className="flex-1 flex">
          {/* Editor Area */}
          <div className={`flex-1 ${showSidebar ? 'lg:mr-80 md:mr-72' : ''}`}>
            {/* Title */}
            <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-8 pb-4 bg-background">
              <div className="max-w-4xl mx-auto">
                <textarea
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title"
                  rows={1}
                  className="w-full bg-transparent text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight placeholder:text-muted-foreground/40 focus:outline-none resize-none overflow-hidden"
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
            <div className="bg-background pb-32 px-4 sm:px-6 md:px-8 overflow-visible">
              <div className="max-w-4xl mx-auto overflow-visible">
                <EditorContent siteId={siteId} />
              </div>
            </div>
          </div>

          {/* Sidebar - Drawer on mobile, fixed on desktop */}
          {/* Desktop Sidebar */}
          <aside className={`hidden md:flex fixed right-0 top-0 w-80 h-screen border-l bg-background flex-col z-[45] pt-12 transition-transform ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="shrink-0 flex items-center justify-between h-12 px-4 border-b bg-background">
              <span className="text-sm font-medium">Settings</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <RightSection
                setThumbnail={setThumbnail}
                thumbnail={thumbnail}
                article={article}
                slug={slug}
                setSlug={setSlug}
                excerpt={excerpt}
                setExcerpt={setExcerpt}
                categories={categories}
                setCategories={setCategories}
              />
            </div>
          </aside>

          {/* Mobile Drawer */}
          {!isDesktop && (
            <Drawer open={showSidebar} onOpenChange={setShowSidebar}>
              <DrawerContent className="h-[85vh] max-h-[96vh]">
                <DrawerHeader className="border-b text-center">
                  <div className="flex items-center justify-between">
                    <DrawerTitle>Settings</DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <RightSection
                    setThumbnail={setThumbnail}
                    thumbnail={thumbnail}
                    article={article}
                    slug={slug}
                    setSlug={setSlug}
                    excerpt={excerpt}
                    setExcerpt={setExcerpt}
                    categories={categories}
                    setCategories={setCategories}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </EditorProvider>
  )
}
