"use client"

import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Avatar({ src = "", alt = "Avatar", fallback = "U", size = "md", className = "" }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  return (
    <ShadcnAvatar className={`${sizeClasses[size]} ${className}`}>
      {src && <AvatarImage src={src || "/placeholder.svg"} alt={alt} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </ShadcnAvatar>
  )
}
