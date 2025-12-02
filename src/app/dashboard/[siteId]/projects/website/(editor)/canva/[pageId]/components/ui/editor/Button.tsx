import { Button as B } from "@/components/ui/button"
import type { CSSProperties } from "react"

interface EditorButtonProps {
  text?: string
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link"
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Button({
  text = "Click me",
  variant = "default",
  className,
  style,
  ...props
}: EditorButtonProps) {
  return (
    <B variant={variant} className={className} style={style} {...props}>
      {text}
    </B>
  )
}
