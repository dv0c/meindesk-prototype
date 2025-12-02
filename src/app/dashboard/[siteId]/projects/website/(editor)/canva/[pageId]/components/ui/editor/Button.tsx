import { Button as B } from "@/components/ui/button"
import { useIsEditorMode } from "@/lib/BuilderMode"
import Link from "next/link"
import type { CSSProperties } from "react"

interface EditorButtonProps {
  text?: string
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link"
  className?: string
  href?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Button({
  text = "Click me",
  variant = "default",
  className,
  style,
  href = "#",
  ...props
}: EditorButtonProps) {
  const isEditor = useIsEditorMode()
  return (
    isEditor ? (
      <B variant={variant} className={className} style={style} {...props}>
        {text}
      </B>
    )
      : (
        <Link href={"#"} target="_blank" rel="noopener noreferrer">
          <B variant={variant} className={className} style={style} {...props}>
            {text}
          </B>
        </Link>
      )
  )
}
