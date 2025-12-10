"use client"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

export interface HeadingProps {
  text?: string
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  align?: "left" | "center" | "right"
  color?: string
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Heading({
  text = "Heading",
  level = "h2",
  align = "left",
  color,
  className,
  style,
  ...props
}: HeadingProps) {
  const Tag = level
  const baseClass = `font-bold text-${align} ${level === "h1"
      ? "text-5xl"
      : level === "h2"
        ? "text-4xl"
        : level === "h3"
          ? "text-3xl"
          : level === "h4"
            ? "text-2xl"
            : level === "h5"
              ? "text-xl"
              : "text-lg"
    }`

  return (
    <Tag className={cn(baseClass, className)} style={{ ...(color ? { color } : {}), ...style }} {...props}>
      {text}
    </Tag>
  )
}

export const HeadingMetadata = {
  name: "Heading",
  category: "basic",
  props: {
    text: { type: "string", default: "Heading" },
    level: { type: "select", options: ["h1", "h2", "h3", "h4", "h5", "h6"], default: "h2" },
    align: { type: "select", options: ["left", "center", "right"], default: "left" },
    color: { type: "string", default: "" },
    className: { type: "string", default: "" },
    style: { type: "object", default: {} },
  },
}
