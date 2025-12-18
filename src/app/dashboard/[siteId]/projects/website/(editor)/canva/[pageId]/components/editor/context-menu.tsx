"use client"

import { useEffect, useRef } from "react"
import { Copy, Trash2, ArrowUp, ArrowDown, Settings, Puzzle, Link2Off, Edit } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onSaveAsSnippet?: () => void
  onUnlinkSnippet?: () => void
  onEditSnippet?: () => void
  isSnippetRef?: boolean
}

export function ContextMenu({ x, y, onClose, onEdit, onDuplicate, onDelete, onMoveUp, onMoveDown, onSaveAsSnippet, onUnlinkSnippet, onEditSnippet, isSnippetRef }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
      style={{ left: x, top: y }}
    >
      <div
        className="bg-popover/95 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-1.5">
          {/* Edit */}
          <button
            className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
            onClick={() => {
              onEdit()
              onClose()
            }}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <span>Edit Properties</span>
          </button>

          {/* Duplicate */}
          <button
            className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
            onClick={() => {
              onDuplicate()
              onClose()
            }}
          >
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Duplicate</span>
          </button>

          {/* Save as Snippet */}
          {onSaveAsSnippet && !isSnippetRef && (
            <button
              className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
              onClick={() => {
                onSaveAsSnippet()
                onClose()
              }}
            >
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Puzzle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span>Save as Snippet</span>
            </button>
          )}

          {/* Unlink Snippet */}
          {isSnippetRef && onUnlinkSnippet && (
            <button
              className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
              onClick={() => {
                onUnlinkSnippet()
                onClose()
              }}
            >
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Link2Off className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Unlink Snippet</span>
            </button>
          )}

          {/* Edit Snippet */}
          {isSnippetRef && onEditSnippet && (
            <button
              className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
              onClick={() => {
                onEditSnippet()
                onClose()
              }}
            >
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Edit Snippet</span>
            </button>
          )}

          {/* Move Up */}
          <button
            className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
            onClick={() => {
              onMoveUp()
              onClose()
            }}
          >
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span>Move Up</span>
          </button>

          {/* Move Down */}
          <button
            className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
            onClick={() => {
              onMoveDown()
              onClose()
            }}
          >
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <ArrowDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span>Move Down</span>
          </button>

          {/* Divider */}
          <div className="border-t border-border/50 my-1.5" />

          {/* Delete */}
          <button
            className="w-full px-3 py-2.5 text-sm font-medium hover:bg-destructive/10 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group"
            onClick={() => {
              onDelete()
              onClose()
            }}
          >
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-destructive">Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
