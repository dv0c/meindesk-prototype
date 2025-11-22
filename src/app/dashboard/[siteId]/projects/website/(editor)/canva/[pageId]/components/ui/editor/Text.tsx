"use client"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

export interface TextProps {
  content?: string
  align?: "left" | "center" | "right" | "justify"
  color?: string
  size?: "sm" | "base" | "lg" | "xl"
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Text({
  content = "Add your text here...",
  align = "left",
  color,
  size = "base",
  className,
  style,
  ...props
}: TextProps) {
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : size === "xl" ? "text-xl" : "text-base"

  return (
    <p
      className={cn(`text-${align} ${sizeClass}`, className)}
      style={{ ...(color ? { color } : {}), ...style }}
      {...props}
    >
      {content}
    </p>
  )
}

export const TextMetadata = {
  name: "Text",
  category: "basic",
  props: {
    content: { type: "string", default: "Add your text here..." },
    align: { type: "select", options: ["left", "center", "right", "justify"], default: "left" },
    color: { type: "string", default: "" },
    size: { type: "select", options: ["sm", "base", "lg", "xl"], default: "base" },
    className: { type: "string", default: "" },
    style: { type: "object", default: {} },
  },
}
