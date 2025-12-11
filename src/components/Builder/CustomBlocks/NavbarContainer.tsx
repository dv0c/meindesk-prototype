"use client"

import { cn } from "@/lib/utils"
import React from "react"

interface NavbarContainerProps {
    backgroundColor?: string
    textColor?: string
    sticky?: boolean
    height?: string
    padding?: string
    shadow?: boolean
    borderBottom?: boolean
    borderColor?: string
    maxWidth?: "full" | "container" | "narrow"
    className?: string
    children?: React.ReactNode
}

export default function NavbarContainer({
    backgroundColor = "#ffffff",
    textColor = "#000000",
    sticky = true,
    height = "auto",
    padding = "16px 24px",
    shadow = true,
    borderBottom = true,
    borderColor = "#e5e7eb",
    maxWidth = "container",
    className = "",
    children,
}: NavbarContainerProps) {
    const maxWidthClass = {
        full: "max-w-full",
        container: "container mx-auto",
        narrow: "max-w-4xl mx-auto",
    }

    return (
        <nav
            className={cn(
                "w-full",
                sticky && "sticky top-0 z-50",
                shadow && "shadow-sm",
                borderBottom && "border-b",
                className
            )}
            style={{
                backgroundColor,
                color: textColor,
                height,
                padding,
                borderColor: borderBottom ? borderColor : undefined,
            }}
        >
            <div className={cn("h-full", maxWidthClass[maxWidth])}>
                <div className="flex items-center justify-between gap-4 h-full">
                    {children}
                </div>
            </div>
        </nav>
    )
}
