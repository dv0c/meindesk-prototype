"use client"

import { Switch as ShadcnSwitch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SwitchProps {
  label?: string
  checked?: boolean
  className?: string
}

export default function Switch({ label = "Switch", checked = false, className = "" }: SwitchProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <ShadcnSwitch id="switch" defaultChecked={checked} />
      {label && <Label htmlFor="switch">{label}</Label>}
    </div>
  )
}
