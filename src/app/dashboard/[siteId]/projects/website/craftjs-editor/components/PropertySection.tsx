"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertySectionProps {
    title: string
    summary?: string
    children: React.ReactNode
    defaultOpen?: boolean
}

export function PropertySection({
    title,
    summary,
    children,
    defaultOpen = true,
}: PropertySectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className={cn(
                "border-b transition-colors",
                isOpen || isHovered ? "border-border" : "border-transparent"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors text-left"
            >
                <span className="font-medium text-sm">{title}</span>
                <div className="flex items-center gap-2">
                    {summary && !isOpen && (
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {summary}
                        </span>
                    )}
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                    {children}
                </div>
            )}
        </div>
    )
}

interface PropertyRowProps {
    label: string
    children: React.ReactNode
    className?: string
}

export function PropertyRow({ label, children, className }: PropertyRowProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            {children}
        </div>
    )
}

interface PropertyInputProps {
    type?: "text" | "number" | "color" | "url"
    value: string | number
    onChange: (value: string) => void
    placeholder?: string
    min?: number
    max?: number
    step?: number
    className?: string
}

export function PropertyInput({
    type = "text",
    value,
    onChange,
    placeholder,
    min,
    max,
    step,
    className,
}: PropertyInputProps) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={cn(
                "w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                className
            )}
        />
    )
}

interface PropertySliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    unit?: string
}

export function PropertySlider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit = "px",
}: PropertySliderProps) {
    return (
        <div className="space-y-1">
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{min}{unit}</span>
                <span className="font-medium text-foreground">{value}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    )
}

interface PropertyColorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function PropertyColor({ value, onChange, placeholder }: PropertyColorProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-12 rounded-md border cursor-pointer bg-background"
            />
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "transparent"}
                className="flex-1 h-9 px-3 text-sm border rounded-md bg-background"
            />
        </div>
    )
}

interface PropertySelectProps {
    value: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
}

export function PropertySelect({ value, onChange, options }: PropertySelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}

interface PropertyButtonGroupProps {
    value: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
}

export function PropertyButtonGroup({ value, onChange, options }: PropertyButtonGroupProps) {
    return (
        <div className="flex gap-1">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "flex-1 h-8 px-2 text-xs border rounded-md transition-colors capitalize",
                        value === option.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}

interface PropertyCheckboxProps {
    id: string
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
}

export function PropertyCheckbox({ id, label, checked, onChange }: PropertyCheckboxProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded border"
            />
            <label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer">
                {label}
            </label>
        </div>
    )
}
