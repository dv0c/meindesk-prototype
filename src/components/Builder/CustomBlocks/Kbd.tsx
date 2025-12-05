"use client"

import { Kbd as ShadcnKbd } from "@/components/ui/kbd"

interface KbdProps {
  keys?: string
  className?: string
}

export default function Kbd({ keys = "Ctrl,C", className = "" }: KbdProps) {
  const keyList = keys.split(",").map((k) => k.trim())

  return (
    <div className={`flex gap-1 ${className}`}>
      {keyList.map((key, idx) => (
        <ShadcnKbd key={idx}>{key}</ShadcnKbd>
      ))}
    </div>
  )
}
