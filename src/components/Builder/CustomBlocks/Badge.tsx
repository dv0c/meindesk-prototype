"use client"

import { Badge as ShadcnBadge } from "@/components/ui/badge"
import type React from "react"

interface BadgeProps {
  text?: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
  children?: React.ReactNode
}

export default function Badge({ text = "Badge", variant = "default", className = "", children }: BadgeProps) {
  return (
    <ShadcnBadge variant={variant} className={className}>
      {children || text}
    </ShadcnBadge>
  )
}
