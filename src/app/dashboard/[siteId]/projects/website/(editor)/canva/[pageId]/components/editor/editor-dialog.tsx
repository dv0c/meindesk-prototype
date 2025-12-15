"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Editor } from "@/components/blocks/editor-x/editor"
import type { SerializedEditorState } from "lexical"
import { $generateHtmlFromNodes } from '@lexical/html'

interface EditorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    value: string
    onSave: (value: string) => void
    title?: string
}

export function EditorDialog({ open, onOpenChange, value, onSave, title = "Edit Content" }: EditorDialogProps) {
    const [editorState, setEditorState] = useState<SerializedEditorState | undefined>(() => {
        // Try to parse existing value as JSON (Lexical state)
        try {
            const parsed = JSON.parse(value)
            // Check if it's a Lexical state object
            if (parsed && typeof parsed === 'object' && parsed.root) {
                return parsed
            }
        } catch {
            // Not valid JSON
        }

        // If value is HTML or plain text, create empty editor (user will paste content)
        return undefined
    })

    const [editorInstance, setEditorInstance] = useState<any>(null)

    const handleEditorReady = useCallback((editor: any) => {
        setEditorInstance(editor)
    }, [])

    const handleSave = () => {
        if (!editorInstance) {
            onSave("")
            onOpenChange(false)
            return
        }

        // Get HTML from editor
        editorInstance.update(() => {
            const htmlString = $generateHtmlFromNodes(editorInstance, null)
            onSave(htmlString)
            onOpenChange(false)
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw]! w-[95vw] h-[95vh] max-h-[95vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto px-6">
                    <Editor
                        editorSerializedState={editorState}
                        onSerializedChange={setEditorState}
                        onEditorReady={handleEditorReady}
                    />
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
