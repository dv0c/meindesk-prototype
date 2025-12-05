"use client"

import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SelectProps {
  label?: string
  placeholder?: string
  options?: string
  className?: string
}

export default function Select({
  label = "",
  placeholder = "Select an option",
  options = "Option 1,Option 2,Option 3",
  className = "",
}: SelectProps) {
  const optionsList = options.split(",").map((opt) => opt.trim())

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <ShadcnSelect>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {optionsList.map((option, idx) => (
            <SelectItem key={idx} value={option.toLowerCase().replace(/\s+/g, "-")}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
    </div>
  )
}
