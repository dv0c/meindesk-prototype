"use client"

import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CheckboxProps {
  label?: string
  checked?: boolean
  className?: string
}

export default function Checkbox({ label = "Checkbox", checked = false, className = "" }: CheckboxProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <ShadcnCheckbox id="checkbox" defaultChecked={checked} />
      {label && <Label htmlFor="checkbox">{label}</Label>}
    </div>
  )
}
