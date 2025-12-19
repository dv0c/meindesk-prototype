"use client"

import { cn } from "@/lib/utils"

interface InsertionIndicatorProps {
    isVisible: boolean
    position?: "before" | "after"
}

/**
 * A horizontal blue line that shows where a dragged element will be dropped.
 * Animated with a subtle pulse effect for visibility.
 */
export function InsertionIndicator({ isVisible, position = "after" }: InsertionIndicatorProps) {
    if (!isVisible) return null

    return (
        <div
            className={cn(
                "absolute left-0 right-0 z-50 pointer-events-none",
                position === "before" ? "-top-1" : "-bottom-1"
            )}
        >
            <div className="relative h-1 mx-4">
                {/* Main line */}
                <div className="absolute inset-0 bg-primary rounded-full animate-pulse" />
                {/* Left dot */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg" />
                {/* Right dot */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg" />
            </div>
        </div>
    )
}
