"use client"

import type React from "react"
import { Card as CardComponent, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardProps {
  title?: string
  description?: string
  content?: string
  className?: string
  [key: string]: any
}

export function Card({
  title = "Card Title",
  description = "Card description",
  content = "Card content goes here",
  className = "",
  children,
  ...props
}: CardProps & { children?: React.ReactNode }) {
  const isEditorMode = props["data-editor-mode"]

  return (
    <CardComponent className={className} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          isEditorMode &&
            !children &&
            !content &&
            "min-h-[80px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-md",
        )}
      >
        {children ||
          content ||
          (isEditorMode && <span className="text-xs text-muted-foreground">Drop components here</span>)}
      </CardContent>
    </CardComponent>
  )
}
