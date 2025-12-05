import type { ReactNode, CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  className?: string
  children?: ReactNode
  style?: CSSProperties
  [key: string]: any
}

export default function Container({ className, children, style, ...props }: ContainerProps) {
  const isEditorMode = props["data-editor-mode"]
  const nodeId = props["data-node-id"]

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 transition-all duration-200",
        isEditorMode && !children && "min-h-[120px] flex items-center justify-center",
        className,
      )}
      style={style}
      {...props}
    >
      {children || (
        <p className="text-sm text-muted-foreground text-center">
          {isEditorMode ? "Drop components here" : "Empty container"}
        </p>
      )}
    </div>
  )
}
