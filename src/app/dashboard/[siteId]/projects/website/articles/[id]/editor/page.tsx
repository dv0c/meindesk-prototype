"use client"

import { SerializedEditorState } from "lexical"
import { use, useEffect, useMemo, useState } from "react"

import { Editor } from "@/components/blocks/editor-x/editor"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useArticle } from "@/hooks/use-article"
import RightSection from "./_comps/RightSection"
import { ArrowLeft } from "lucide-react"

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
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [loaded, setLoaded] = useState(false)

  const { article, getArticle, updateArticle, loading } = useArticle()

  // Fetch article
  useEffect(() => {
    if (!articleId || !siteId) return
    getArticle(siteId, articleId)
  }, [articleId, siteId, getArticle])

  // Initialize state when article loads
  useEffect(() => {
    if (!article || loaded) return
    setTitle(article.title || "")
    setEditorState(article.content || "")
    setSlug(article.slug || "")
    setExcerpt(article.excerpt || "")
    setLoaded(true)
    setThumbnail(article.cover || "")
  }, [article, loaded])

  const handleSave = async () => {
    if (!articleId || !siteId) return
    await updateArticle(siteId, articleId, {
      title,
      content: editorState,
      slug,
      excerpt,
      cover: thumbnail
    })
  }

  const handleStatus = async ({ status }: { status: string }) => {
    if (!articleId || !siteId) return
    await updateArticle(siteId, articleId, { status })
  }

  // Determine if there are unsaved changes
  const unsavedChanges = useMemo(() => {
    if (!article) return false
    const titleChanged = title !== (article.title || "")
    const contentChanged = JSON.stringify(editorState) !== JSON.stringify(article.content || "")
    const slugChanged = slug !== (article.slug || "")
    const excerptChanged = excerpt !== (article.excerpt || "")
    const thumbnailChanged = thumbnail !== (article.cover || "")
    return titleChanged || contentChanged || slugChanged || excerptChanged || thumbnailChanged
  }, [title, editorState, slug, excerpt, article, thumbnail])

  if (!loaded) {
    return (
      <div>
        {/* Header skeleton */}
        <header className="border-t border-b shadow sticky top-0 bg-background z-20 p-3 mb-10">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 bg-muted animate-pulse rounded" />
              <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-5 justify-center">
          {/* Main content skeleton */}
          <div className="space-y-5 max-w-[64.5rem] w-full">
            {/* Title section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>

            {/* Content editor section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              </div>
              <div className="border rounded-lg p-4 min-h-[400px]">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar skeleton */}
          <div className="space-y-5 w-full lg:w-72">
            {/* Slug section */}
            <div className="space-y-3">
              <div className="h-5 w-12 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>

            {/* Excerpt section */}
            <div className="space-y-3">
              <div className="h-5 w-16 bg-muted animate-pulse rounded" />
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
            </div>

            {/* Thumbnail section */}
            <div className="space-y-3">
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              <div className="h-40 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="border-t border-b shadow sticky top-0 bg-background z-20 p-3 mb-10">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <Button onClick={() => history.back()} variant="ghost" size="icon-sm" className="mr-2 cursor-pointer">
              <ArrowLeft className="inline-block" />
            </Button>
            <span className="text-lg font-semibold">Editing Article</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="cursor-pointer" variant="outline" disabled={loading}>
                  {article.status}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatus({ status: 'PUBLISHED' })}>
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatus({ status: 'DRAFT' })}>
                  Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="cursor-pointer"
              disabled={loading || !unsavedChanges}
              onClick={handleSave}
            >
              {loading ? "Saving..." : unsavedChanges ? "Unsaved changes" : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-5 justify-center">
        <div className="space-y-5 max-w-[64.5rem] w-full">
          <div className="space-y-3">
            <div className="flex items-center gap-1 flex-wrap">
              <h4 className="font-semibold">Title</h4>
              <p className="text-accent">(Name your article)</p>
            </div>
            <Input
              placeholder="Untitled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1 flex-wrap">
              <h4 className="font-semibold">Content</h4>
              <p className="text-accent">(Write your blog article)</p>
            </div>
            <Editor
              editorSerializedState={editorState}
              onSerializedChange={(value) => setEditorState(value)}
            />
          </div>
        </div>
        <RightSection
          setThumbnail={setThumbnail}
          thumbnail={thumbnail}
          article={article}
          slug={slug}
          setSlug={setSlug}
          excerpt={excerpt}
          setExcerpt={setExcerpt}
        />
      </div>
    </div>
  )
}
