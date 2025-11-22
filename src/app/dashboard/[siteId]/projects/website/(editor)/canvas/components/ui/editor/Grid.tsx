import type { ReactNode, CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface GridProps {
  columns?: number
  gap?: number
  padding?: number
  className?: string
  children?: ReactNode
  style?: CSSProperties
  [key: string]: any
}

export default function Grid({ columns = 2, gap = 4, padding = 4, className, children, style, ...props }: GridProps) {
  return (
    <div
      className={cn("grid w-full", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 0.25}rem`,
        padding: `${padding * 0.25}rem`,
        ...style,
      }}
      {...props}
    >
      {children || (
        <div className="col-span-full p-8 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground">
          Grid Container ({columns} Columns) - Drop items here
        </div>
      )}
    </div>
  )
}
