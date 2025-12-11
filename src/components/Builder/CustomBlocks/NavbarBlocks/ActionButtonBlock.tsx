"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ActionButtonBlockProps {
    text?: string
    variant?: "default" | "secondary" | "outline" | "destructive"
    href?: string
    size?: "sm" | "default" | "lg"
    align?: "left" | "center" | "right"
    marginLeft?: string
    marginRight?: string
    backgroundColor?: string
    textColor?: string
    className?: string
}

export default function ActionButtonBlock({
    text = "Get Started",
    variant = "default",
    href = "#",
    size = "default",
    align = "right",
    marginLeft = "0",
    marginRight = "0",
    backgroundColor,
    textColor,
    className = "",
}: ActionButtonBlockProps) {
    const alignClasses = {
        left: "mr-auto",
        center: "mx-auto",
        right: "ml-auto",
    }

    return (
        <div
            className={alignClasses[align]}
            style={{
                marginLeft: marginLeft !== "0" ? marginLeft : undefined,
                marginRight: marginRight !== "0" ? marginRight : undefined,
            }}
        >
            <Button
                asChild
                variant={variant}
                size={size}
                className={className}
                style={{
                    backgroundColor,
                    color: textColor,
                }}
            >
                <Link href={href}>{text}</Link>
            </Button>
        </div>
    )
}
