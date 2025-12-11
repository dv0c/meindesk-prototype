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
    justifyContent?: "start" | "center" | "end" | "between"
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
    justifyContent = "between",
    className = "",
    children,
}: NavbarContainerProps) {
    const maxWidthClass = {
        full: "max-w-full",
        container: "container mx-auto",
        narrow: "max-w-4xl mx-auto",
    }

    const justifyClasses = {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
    }

    // Ensure we have a valid justify value, defaulting to 'start' for manual control
    const activeJustify = justifyContent || "start";

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
                <div className={cn("flex items-center w-full gap-4 h-full", justifyClasses[activeJustify])}>
                    {children}
                </div>
            </div>
        </nav>
    )
}
