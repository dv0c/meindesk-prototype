import type { ReactNode, CSSProperties } from "react"
import { cn } from "@/lib/utils"
import React from "react"

interface ContainerProps {
  className?: string
  children?: ReactNode
  style?: CSSProperties
  [key: string]: any
}

export default function Container({ className, children, style, ...props }: ContainerProps) {
  const hasChildren =
    React.Children.count(children) > 0 &&
    React.Children.toArray(children).some((child) => child !== null && child !== undefined)
  console.log(children)
  return (
    <div
      className={cn("rounded-lg border bg-card p-6", className)}
      style={style}
      {...props}
    >
      {hasChildren ? children : (
        <p className="text-sm text-muted-foreground text-center">
          Container - Drop components here
        </p>
      )}
    </div>
  )
}
