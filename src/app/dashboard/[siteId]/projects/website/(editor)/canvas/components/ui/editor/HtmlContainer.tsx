import type React from "react"
import type { ReactNode, ElementType, CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface HtmlContainerProps {
  tag?: string
  className?: string
  styles?: string
  children?: ReactNode
  style?: CSSProperties
  [key: string]: any
}

export default function HtmlContainer({
  tag = "div",
  className,
  styles,
  children,
  style,
  ...props
}: HtmlContainerProps) {
  const Component = (tag as ElementType) || "div"

  // Parse styles string "color: red; font-size: 20px" -> object
  const styleObject = styles
    ? styles.split(";").reduce(
        (acc, style) => {
          const [key, value] = style.split(":")
          if (key && value) {
            const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase())
            acc[camelKey as keyof React.CSSProperties] = value.trim()
          }
          return acc
        },
        {} as Record<string, string>,
      )
    : {}

  return (
    <Component className={cn(className)} style={{ ...styleObject, ...style }} {...props}>
      {children || (
        <div className="p-4 border border-dashed border-muted text-muted-foreground text-center text-sm">
          HTML Block ({tag}) - Drop items here
        </div>
      )}
    </Component>
  )
}
