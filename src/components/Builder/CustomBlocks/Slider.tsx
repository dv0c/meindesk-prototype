"use client"

import { Slider as ShadcnSlider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface SliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  className?: string
}

export default function Slider({
  label = "",
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  className = "",
}: SliderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <ShadcnSlider defaultValue={[defaultValue]} min={min} max={max} step={step} className="w-full" />
    </div>
  )
}
