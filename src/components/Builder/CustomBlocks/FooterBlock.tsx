"use client"

import { cn } from "@/lib/utils"

interface FooterBlockProps {
    copyright?: string
    attribution?: string
    links?: { label: string; href: string }[]
    backgroundColor?: string
    textColor?: string
    padding?: string
    textAlign?: "left" | "center" | "right"
    fontSize?: "sm" | "base" | "lg"
    className?: string
}

export default function FooterBlock({
    copyright = "© 2024 All rights reserved",
    attribution,
    links = [],
    backgroundColor = "#2C2C2C",
    textColor = "#F5F3F0",
    padding = "40px 24px",
    textAlign = "center",
    fontSize = "sm",
    className = "",
}: FooterBlockProps) {
    const alignmentClasses = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end",
    }

    const fontSizes = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
    }

    return (
        <footer
            className={cn("w-full flex flex-col", alignmentClasses[textAlign], className)}
            style={{
                backgroundColor,
                color: textColor,
                padding,
            }}
        >
            <div className="container mx-auto max-w-4xl">
                {links.length > 0 && (
                    <nav className={cn("flex gap-6 mb-4",
                        textAlign === "center" ? "justify-center" :
                            textAlign === "right" ? "justify-end" : "justify-start"
                    )}>
                        {links.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="hover:opacity-70 transition-opacity"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                )}

                <p className={fontSizes[fontSize]}>{copyright}</p>

                {attribution && (
                    <p className={cn(fontSizes[fontSize], "mt-2 opacity-70")}>
                        {attribution}
                    </p>
                )}
            </div>
        </footer>
    )
}
