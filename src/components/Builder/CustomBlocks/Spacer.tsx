"use client"
import type { CSSProperties } from "react"
import { useIsEditorMode } from "@/lib/mode"

export interface SpacerProps {
  height?: number
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Spacer({ height = 40, className, style, ...props }: SpacerProps) {
  const isEditorMode = useIsEditorMode()

  return (
    <div style={{ height: `${height}px`, ...style }} className={className} {...props}>
      {isEditorMode && (
        <div className="w-full h-full flex items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded">
          <span className="text-xs text-muted-foreground font-medium">Spacer: {height}px</span>
        </div>
      )}
    </div>
  )
}

export const SpacerMetadata = {
  name: "Spacer",
  category: "basic",
  props: {
    height: { type: "number", default: 40 },
    className: { type: "string", default: "" },
    style: { type: "object", default: {} },
  },
}
