"use client"

import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface TextareaProps {
  label?: string
  placeholder?: string
  rows?: number
  className?: string
}

export default function Textarea({
  label = "",
  placeholder = "Enter text...",
  rows = 4,
  className = "",
}: TextareaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <ShadcnTextarea placeholder={placeholder} rows={rows} />
    </div>
  )
}
