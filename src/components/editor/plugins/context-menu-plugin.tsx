"use client"

import type { JSX } from "react"
import { useCallback, useMemo, useState } from "react"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  NodeContextMenuOption,
  NodeContextMenuPlugin,
  NodeContextMenuSeparator,
} from "@lexical/react/LexicalNodeContextMenuPlugin"
import {
  $getNodeByKey,
  $getSelection,
  $isDecoratorNode,
  $isNodeSelection,
  $isRangeSelection,
  COPY_COMMAND,
  CUT_COMMAND,
  PASTE_COMMAND,
  type LexicalNode,
} from "lexical"
import {
  Clipboard,
  ClipboardType,
  Copy,
  ImageIcon,
  Link2Off,
  Scissors,
  Trash2,
} from "lucide-react"

import { $isImageNode } from "@/components/editor/nodes/image-node"
import MediaLibraryDialog, { type MediaItem } from "@/components/MediaGallery/media-select"

export function ContextMenuPlugin({ siteId }: { siteId?: string }): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [selectedImageNodeKey, setSelectedImageNodeKey] = useState<string | null>(null)

  const handleChangeImage = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes()
        const imageNode = nodes.find((node) => $isImageNode(node))
        if (imageNode) {
          setSelectedImageNodeKey(imageNode.getKey())
          setIsMediaDialogOpen(true)
        }
      }
    })
  }, [editor])

  const handleMediaSelect = useCallback((items: MediaItem[]) => {
    if (items.length > 0 && selectedImageNodeKey) {
      const newSrc = items[0].url
      editor.update(() => {
        const node = $getNodeByKey(selectedImageNodeKey)
        if (node && $isImageNode(node)) {
          node.setSrc(newSrc)
          if (items[0].alt) {
            node.setAltText(items[0].alt)
          }
        }
      })
    }
    setIsMediaDialogOpen(false)
    setSelectedImageNodeKey(null)
  }, [editor, selectedImageNodeKey])

  const items = useMemo(() => {
    return [
      // Image-specific options
      new NodeContextMenuOption(`Change Image`, {
        $onSelect: () => {
          handleChangeImage()
        },
        $showOn: (node: LexicalNode) => $isImageNode(node),
        disabled: !siteId,
        icon: <ImageIcon className="h-4 w-4" />,
      }),
      new NodeContextMenuSeparator({
        $showOn: (node: LexicalNode) => $isImageNode(node),
      }),
      // Link options
      new NodeContextMenuOption(`Remove Link`, {
        $onSelect: () => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        },
        $showOn: (node: LexicalNode) => $isLinkNode(node.getParent()),
        disabled: false,
        icon: <Link2Off className="h-4 w-4" />,
      }),
      new NodeContextMenuSeparator({
        $showOn: (node: LexicalNode) => $isLinkNode(node.getParent()),
      }),
      // General options
      new NodeContextMenuOption(`Cut`, {
        $onSelect: () => {
          editor.dispatchCommand(CUT_COMMAND, null)
        },
        disabled: false,
        icon: <Scissors className="h-4 w-4" />,
      }),
      new NodeContextMenuOption(`Copy`, {
        $onSelect: () => {
          editor.dispatchCommand(COPY_COMMAND, null)
        },
        disabled: false,
        icon: <Copy className="h-4 w-4" />,
      }),
      new NodeContextMenuOption(`Paste`, {
        $onSelect: () => {
          navigator.clipboard.read().then(async function (...args) {
            const data = new DataTransfer()

            const readClipboardItems = await navigator.clipboard.read()
            const item = readClipboardItems[0]

            const permission = await navigator.permissions.query({
              // @ts-expect-error These types are incorrect.
              name: "clipboard-read",
            })
            if (permission.state === "denied") {
              alert("Not allowed to paste from clipboard.")
              return
            }

            for (const type of item.types) {
              const dataString = await (await item.getType(type)).text()
              data.setData(type, dataString)
            }

            const event = new ClipboardEvent("paste", {
              clipboardData: data,
            })

            editor.dispatchCommand(PASTE_COMMAND, event)
          })
        },
        disabled: false,
        icon: <Clipboard className="h-4 w-4" />,
      }),
      new NodeContextMenuOption(`Paste as Plain Text`, {
        $onSelect: () => {
          navigator.clipboard.read().then(async function (...args) {
            const permission = await navigator.permissions.query({
              // @ts-expect-error These types are incorrect.
              name: "clipboard-read",
            })

            if (permission.state === "denied") {
              alert("Not allowed to paste from clipboard.")
              return
            }

            const data = new DataTransfer()
            const clipboardText = await navigator.clipboard.readText()
            data.setData("text/plain", clipboardText)

            const event = new ClipboardEvent("paste", {
              clipboardData: data,
            })
            editor.dispatchCommand(PASTE_COMMAND, event)
          })
        },
        disabled: false,
        icon: <ClipboardType className="h-4 w-4" />,
      }),
      new NodeContextMenuSeparator(),
      new NodeContextMenuOption(`Remove`, {
        $onSelect: () => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isNodeSelection(selection)) {
              selection.getNodes().forEach((node) => {
                node.remove()
              })
            } else if ($isRangeSelection(selection)) {
              const node = selection.anchor.getNode();
              const topLevelElement = node.getTopLevelElement();
              if (topLevelElement) {
                topLevelElement.remove();
              }
            }
          })
        },
        disabled: false,
        icon: <Trash2 className="h-4 w-4" />,
      }),
    ]
  }, [editor, handleChangeImage, siteId])

  return (
    <>
      <NodeContextMenuPlugin
        className="bg-popover/95 backdrop-blur-sm text-popover-foreground z-[9999] min-w-[180px] overflow-hidden rounded-lg border border-border/50 p-1 shadow-xl outline-none"
        itemClassName="relative w-full flex cursor-default items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none select-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
        separatorClassName="bg-border/50 my-1 h-px"
        items={items}
      />
      {siteId && (
        <MediaLibraryDialog
          siteId={siteId}
          isOpen={isMediaDialogOpen}
          onClose={() => {
            setIsMediaDialogOpen(false)
            setSelectedImageNodeKey(null)
          }}
          onSelect={handleMediaSelect}
          multiSelect={false}
        />
      )}
    </>
  )
}

