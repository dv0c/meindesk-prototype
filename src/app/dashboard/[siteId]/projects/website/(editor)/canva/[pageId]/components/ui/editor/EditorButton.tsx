import { Button } from "@/components/ui/button"
import type { CSSProperties } from "react"

interface EditorButtonProps {
  text?: string
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link"
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function EditorButton({
  text = "Click me",
  variant = "default",
  className,
  style,
  ...props
}: EditorButtonProps) {
  return (
    <Button variant={variant} className={className} style={style} {...props}>
      {text}
    </Button>
  )
}
