"use client"

import { Spinner as ShadcnSpinner } from "@/components/ui/spinner"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return <ShadcnSpinner size={size} className={className} />
}
