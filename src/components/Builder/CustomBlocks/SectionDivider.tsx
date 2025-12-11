"use client"

import { cn } from "@/lib/utils"

interface SectionDividerProps {
    height?: string
    backgroundColor?: string
    showLine?: boolean
    lineColor?: string
    lineWidth?: string
    className?: string
}

export default function SectionDivider({
    height = "60px",
    backgroundColor = "transparent",
    showLine = false,
    lineColor = "#E5E7EB",
    lineWidth = "1px",
    className = "",
}: SectionDividerProps) {
    return (
        <div
            className={cn("w-full flex items-center justify-center", className)}
            style={{
                height,
                backgroundColor,
            }}
        >
            {showLine && (
                <div
                    className="w-full max-w-4xl"
                    style={{
                        height: lineWidth,
                        backgroundColor: lineColor,
                    }}
                />
            )}
        </div>
    )
}
