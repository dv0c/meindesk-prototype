"use client"

import { Progress as ShadcnProgress } from "@/components/ui/progress"

interface ProgressProps {
  value?: number
  className?: string
}

export default function Progress({ value = 50, className = "" }: ProgressProps) {
  return <ShadcnProgress value={value} className={className} />
}
