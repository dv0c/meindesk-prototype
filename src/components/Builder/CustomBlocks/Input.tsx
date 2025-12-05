"use client"

import { Input as ShadcnInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputProps {
  label?: string
  placeholder?: string
  type?: string
  className?: string
}

export default function Input({
  label = "",
  placeholder = "Enter text...",
  type = "text",
  className = "",
}: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <ShadcnInput type={type} placeholder={placeholder} />
    </div>
  )
}
