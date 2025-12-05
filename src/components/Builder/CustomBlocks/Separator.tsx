"use client"

import { Separator as ShadcnSeparator } from "@/components/ui/separator"

interface SeparatorProps {
  orientation?: "horizontal" | "vertical"
  className?: string
}

export default function Separator({ orientation = "horizontal", className = "" }: SeparatorProps) {
  return <ShadcnSeparator orientation={orientation} className={className} />
}
