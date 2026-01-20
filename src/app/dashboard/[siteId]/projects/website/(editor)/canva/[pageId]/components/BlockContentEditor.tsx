
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Edit, Save, ArrowLeft, Maximize2 } from "lucide-react"
import { EditorProvider, EditorContent, EditorToolbar } from "@/components/blocks/editor-x/editor"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $generateNodesFromDOM } from "@lexical/html"
import { $getRoot, $insertNodes } from "lexical"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// -----------------------------------------------------------------------------
// Helper Plugins
// -----------------------------------------------------------------------------

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

interface BlockContentEditorProps {
    content: string
    onChange: (html: string) => void
    title?: string
    trigger?: React.ReactNode
}

export function BlockContentEditor({ content, onChange, title = "Edit Content", trigger }: BlockContentEditorProps) {
    const [open, setOpen] = useState(false)


    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Content
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[calc(100vw-40px)] md:max-w-5xl p-0 gap-0 overflow-hidden flex flex-col bg-background z-[150] border-l"
            >
                {/* Header matches ArticleEditor style */}
                <header className="sticky top-0 z-50 h-12 shrink-0 flex items-center justify-between px-4 border-b bg-background">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setOpen(false)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium truncate max-w-[200px]">
                            {title}
                        </span>
                        <span className="text-xs text-orange-500 font-medium">Changes saved automatically</span>

                    </div>


                </header>

                <div className="flex-1 flex flex-col min-h-0 bg-background relative">
                    {open && (
                        <EditorProvider
                            onHtmlChange={(html) => {
                                onChange(html)
                            }}
                        >
                            {/* Toolbar */}
                            <div className="sticky top-0 z-40 shrink-0 border-b bg-background h-12 flex items-center">
                                <EditorToolbar />
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
                                <div className="max-w-3xl mx-auto min-h-[500px] pb-32">
                                    {/* Default Title Placeholder if needed, or just content */}
                                    <div className="prose prose-sm dark:prose-invert max-w-none focus:outline-none">
                                        <EditorContent />
                                    </div>
                                </div>
                            </div>
                            <HtmlLoaderPlugin html={content} />
                        </EditorProvider>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
