"use client"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

export interface ImageProps {
  src?: string
  alt?: string
  width?: string
  height?: string
  rounded?: boolean
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export default function Image({
  src = "/placeholder.svg?height=400&width=600",
  alt = "Image",
  width = "100%",
  height = "auto",
  rounded = false,
  className,
  style,
  ...props
}: ImageProps) {
  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      style={{ width, height, ...style }}
      className={cn(`object-cover ${rounded ? "rounded-lg" : ""}`, className)}
      {...props}
    />
  )
}

export const ImageMetadata = {
  name: "Image",
  category: "basic",
  props: {
    src: { type: "string", default: "/placeholder.svg?height=400&width=600" },
    alt: { type: "string", default: "Image" },
    width: { type: "string", default: "100%" },
    height: { type: "string", default: "auto" },
    rounded: { type: "boolean", default: false },
    className: { type: "string", default: "" },
    style: { type: "object", default: {} },
  },
}
