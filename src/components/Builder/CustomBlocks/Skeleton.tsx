"use client"

import { Skeleton as ShadcnSkeleton } from "@/components/ui/skeleton"

interface SkeletonProps {
  width?: string
  height?: string
  variant?: "default" | "circle" | "text"
  className?: string
}

export default function Skeleton({
  width = "100%",
  height = "20px",
  variant = "default",
  className = "",
}: SkeletonProps) {
  const variantClass = variant === "circle" ? "rounded-full" : variant === "text" ? "h-4" : ""

  return <ShadcnSkeleton className={`${variantClass} ${className}`} style={{ width, height }} />
}
