"use client"
import { Separator } from "@/components/ui/separator"
import type { CSSProperties } from "react"

export interface DividerProps {
  spacing?: number
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Divider({ spacing = 20, className, style, ...props }: DividerProps) {
  return (
    <div style={{ paddingTop: spacing, paddingBottom: spacing, ...style }} className={className} {...props}>
      <Separator />
    </div>
  )
}

export const DividerMetadata = {
  name: "Divider",
  category: "basic",
  props: {
    spacing: { type: "number", default: 20 },
    className: { type: "string", default: "" },
    style: { type: "object", default: {} },
  },
}
