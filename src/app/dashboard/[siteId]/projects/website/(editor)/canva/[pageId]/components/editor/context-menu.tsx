"use client"

import { useEffect, useRef } from "react"
import { Copy, Trash2, ArrowUp, ArrowDown, Settings } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function ContextMenu({ x, y, onClose, onEdit, onDuplicate, onDelete, onMoveUp, onMoveDown }: ContextMenuProps) {
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
    <div ref={menuRef} className="fixed z-[9999]" style={{ left: x, top: y }}>
      <div className="bg-popover border rounded-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="py-1 min-w-[180px]">
          <button
            className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-left"
            onClick={() => {
              onEdit()
              onClose()
            }}
          >
            <Settings className="h-4 w-4" />
            Edit Properties
          </button>
          <button
            className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-left"
            onClick={() => {
              onDuplicate()
              onClose()
            }}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <button
            className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-left"
            onClick={() => {
              onMoveUp()
              onClose()
            }}
          >
            <ArrowUp className="h-4 w-4" />
            Move Up
          </button>
          <button
            className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-left"
            onClick={() => {
              onMoveDown()
              onClose()
            }}
          >
            <ArrowDown className="h-4 w-4" />
            Move Down
          </button>
          <div className="border-t my-1" />
          <button
            className="w-full px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2 text-left"
            onClick={() => {
              onDelete()
              onClose()
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
