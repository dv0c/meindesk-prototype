'use client'

import { SerializedEditorState } from "lexical"
import { use, useEffect, useMemo, useState } from "react"

import { Editor } from "@/components/blocks/editor-x/editor"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { usePages } from "@/hooks/use-pages"
import { ArrowLeft } from "lucide-react"
import RightSection from "./_comps/RightSection"

interface EditorPageProps {
  params: {
    id: string
    siteId: string
  }
}

export default function PageEditor({ params }: EditorPageProps) {
  const { id: pageId, siteId } = use(params as any) as any

  const [title, setTitle] = useState("")
  const [editorState, setEditorState] = useState<SerializedEditorState>()
  const [loaded, setLoaded] = useState(false)

  const { page, getPage, updatePage, loading } = usePages()

  useEffect(() => {
    if (!pageId || !siteId) return
    getPage(siteId, pageId)
  }, [pageId, siteId, getPage])

  useEffect(() => {
    if (!page || loaded) return
    setTitle(page.title || "")
    setEditorState(page.content || "")
    setLoaded(true)
  }, [page, loaded])

  const handleSave = async () => {
    if (!pageId || !siteId) return
    await updatePage(siteId, pageId, { title, content: editorState })
  }

  const handleStatus = async ({ status }: { status: string }) => {
    if (!pageId || !siteId) return
    await updatePage(siteId, pageId, { status })
  }

  const unsavedChanges = useMemo(() => {
    if (!page) return false
    const titleChanged = title !== (page.title || "")
    const contentChanged = JSON.stringify(editorState) !== JSON.stringify(page.content)
    return titleChanged || contentChanged
  }, [title, editorState, page])

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
          <div>
            <Button onClick={() => history.back()} variant={'ghost'} size={'icon-sm'} className="mr-2 cursor-pointer">
              <ArrowLeft className="inline-block" />
            </Button>
            <span className="text-lg font-semibold">Editing Page</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="cursor-pointer" variant="outline" disabled={loading}>
                  {page.status}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatus({ status: 'PUBLISHED' })}>
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatus({ status: 'DRAFT' })}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatus({ status: 'ARCHIVED' })}>
                  Archived
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
              <p className="text-accent">(Name your page)</p>
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
              <p className="text-accent">(Write your page content)</p>
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
