"use client"

import { SerializedEditorState } from "lexical"
import { use, useEffect, useMemo, useState } from "react"

import { Editor } from "@/components/blocks/editor-x/editor"
import { ImagesPlugin } from "@/components/editor/plugins/images-plugin"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useArticle } from "@/hooks/use-article"
import RightSection from "./_comps/RightSection"

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
  const [loaded, setLoaded] = useState(false)

  const { article, getArticle, updateArticle, loading } = useArticle()

  useEffect(() => {
    if (!articleId || !siteId) return
    getArticle(siteId, articleId)
  }, [articleId, siteId, getArticle])

  useEffect(() => {
    if (!article || loaded) return
    setTitle(article.title || "")
    setEditorState(article.content)
    setLoaded(true)
  }, [article, loaded])

  const handleSave = async () => {
    if (!articleId || !siteId) return
    await updateArticle(siteId, articleId, { title, content: editorState })
  }

  const handleStatus = async ({ status }: { status: string }) => {
    if (!articleId || !siteId) return
    await updateArticle(siteId, articleId, { status })
  }

  // Determine if there are unsaved changes
  const unsavedChanges = useMemo(() => {
    if (!article) return false
    const titleChanged = title !== (article.title || "")
    const contentChanged = JSON.stringify(editorState) !== JSON.stringify(article.content)
    return titleChanged || contentChanged
  }, [title, editorState, article])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <header className="border-t border-b shadow sticky top-0 bg-background z-20 p-3 mb-10">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div >
            <h1 className="text-3xl font-bold">Article</h1>
            <p className="text-sm ">Title: {title}</p>
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
        <RightSection />
      </div>
    </div>
  )
}
