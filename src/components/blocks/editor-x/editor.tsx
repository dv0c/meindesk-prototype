'use client'

import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { EditorState, SerializedEditorState } from 'lexical'
import { useEffect, useRef, ReactNode } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $generateHtmlFromNodes } from '@lexical/html'

import { editorTheme } from '@/components/editor/themes/editor-theme'
import { TooltipProvider } from '@/components/ui/tooltip'

import { nodes } from './nodes'
import { EditorToolbar, EditorContent, EditorFooter } from './plugins'

const editorConfig: InitialConfigType = {
  namespace: 'Editor',
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

// Small helper component to expose the editor instance
function EditorReadyPlugin({ onEditorReady }: { onEditorReady?: (editor: any) => void }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (onEditorReady) onEditorReady(editor)
  }, [editor, onEditorReady])
  return null
}

// Plugin to generate HTML on initial editor load
function InitialHtmlPlugin({ onHtmlChange }: { onHtmlChange?: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!onHtmlChange || initializedRef.current) return

    // Generate initial HTML after editor mounts
    const timeout = setTimeout(() => {
      editor.read(() => {
        const html = $generateHtmlFromNodes(editor, null)
        onHtmlChange(html)
        initializedRef.current = true
      })
    }, 100)

    return () => clearTimeout(timeout)
  }, [editor, onHtmlChange])

  return null
}

// Inline editor with toolbar inside
export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  onEditorReady,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  onEditorReady?: (editor: any) => void
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-background">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <EditorToolbar />
          <EditorContent />
          <EditorFooter />
          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
            }}
          />
          <EditorReadyPlugin onEditorReady={onEditorReady} />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}

// Split editor with external toolbar positioning
export function EditorProvider({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  onHtmlChange,
  onEditorReady,
  children,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  onHtmlChange?: (html: string) => void
  onEditorReady?: (editor: any) => void
  children: ReactNode
}) {
  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        ...(editorState ? { editorState } : {}),
        ...(editorSerializedState
          ? { editorState: JSON.stringify(editorSerializedState) }
          : {}),
      }}
    >
      <TooltipProvider>
        {children}
        <OnChangePlugin
          ignoreSelectionChange={true}
          onChange={(editorState, editor) => {
            onChange?.(editorState)
            onSerializedChange?.(editorState.toJSON())

            // Generate HTML if callback provided
            if (onHtmlChange) {
              editor.read(() => {
                const html = $generateHtmlFromNodes(editor, null)
                onHtmlChange(html)
              })
            }
          }}
        />
        <InitialHtmlPlugin onHtmlChange={onHtmlChange} />
        <EditorReadyPlugin onEditorReady={onEditorReady} />
      </TooltipProvider>
    </LexicalComposer>
  )
}

// Re-export toolbar and content for external use
export { EditorToolbar, EditorContent, EditorFooter } from './plugins'
