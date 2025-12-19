"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddSectionButtonProps {
    onAdd: () => void
    className?: string
}

/**
 * A "+" button that appears between components for easy insertion.
 * Shows on hover with a smooth fade animation.
 */
export function AddSectionButton({ onAdd, className }: AddSectionButtonProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className={cn(
                "group relative h-6 flex items-center justify-center cursor-pointer transition-all duration-200",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onAdd}
        >
            {/* Hover line */}
            <div
                className={cn(
                    "absolute inset-x-4 h-0.5 bg-primary/20 transition-all duration-200",
                    isHovered ? "opacity-100 bg-primary/40" : "opacity-0 group-hover:opacity-100"
                )}
            />

            {/* Plus button */}
            <button
                className={cn(
                    "relative z-10 flex items-center justify-center w-7 h-7 rounded-full",
                    "bg-background border-2 border-primary/30 shadow-sm",
                    "transition-all duration-200 ease-out",
                    isHovered
                        ? "scale-110 border-primary bg-primary text-primary-foreground shadow-md"
                        : "opacity-0 group-hover:opacity-100 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={(e) => {
                    e.stopPropagation()
                    onAdd()
                }}
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    )
}
