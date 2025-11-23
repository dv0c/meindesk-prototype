import type { ReactNode, CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  className?: string
  children?: ReactNode
  style?: CSSProperties
  [key: string]: any
}

export default function Container({ className, children, style, ...props }: ContainerProps) {
  return (
    <div className={cn("rounded-lg border relative bg-card p-6", className)} style={style} {...props}>
      {children || <p className="text-sm text-muted-foreground text-center">Container - Drop components here</p>}
    </div>
  )
}
