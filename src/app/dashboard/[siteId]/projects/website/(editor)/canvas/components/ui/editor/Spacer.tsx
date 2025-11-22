"use client"
import type { CSSProperties } from "react"

export interface SpacerProps {
  height?: number
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Spacer({ height = 40, className, style, ...props }: SpacerProps) {
  return <div style={{ height: `${height}px`, ...style }} className={className} {...props} />
}

export const SpacerMetadata = {
  name: "Spacer",
  category: "basic",
  props: {
    height: { type: "number", default: 40 },
    className: { type: "string", default: "" },
    style: { type: "object", default: {} },
  },
}
