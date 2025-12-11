"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface NavLink {
    label: string
    href: string
    submenu?: NavLink[]
}

interface NavigationBlockProps {
    links?: NavLink[]
    orientation?: "horizontal" | "vertical"
    spacing?: "sm" | "md" | "lg"
    hoverStyle?: "underline" | "background" | "color"
    fontSize?: "sm" | "base" | "lg"
    fontWeight?: "normal" | "medium" | "semibold" | "bold"
    textColor?: string
    hoverColor?: string
    align?: "left" | "center" | "right"
    className?: string
}

export default function NavigationBlock({
    links = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        {
            label: "Services", href: "/services", submenu: [
                { label: "Web Design", href: "/services/web-design" },
                { label: "Development", href: "/services/development" },
            ]
        },
        { label: "Contact", href: "/contact" },
    ],
    orientation = "horizontal",
    spacing = "md",
    hoverStyle = "underline",
    fontSize = "base",
    fontWeight = "medium",
    textColor,
    hoverColor,
    align = "center",
    className = "",
}: NavigationBlockProps) {
    const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

    const spacingClasses = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    }

    const hoverClasses = {
        underline: "hover:underline",
        background: "hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md transition-colors",
        color: hoverColor ? "" : "hover:text-primary transition-colors",
    }

    const fontSizeClasses = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
    }

    const fontWeightClasses = {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
    }

    const alignClasses = {
        left: "mr-auto",
        center: "mx-auto",
        right: "ml-auto",
    }

    const orientationClass = orientation === "horizontal" ? "flex-row" : "flex-col"

    return (
        <nav
            className={cn(
                "flex",
                orientationClass,
                spacingClasses[spacing],
                alignClasses[align],
                className
            )}
            style={{ color: textColor }}
        >
            {links.map((link, index) => (
                <div
                    key={index}
                    className="relative"
                    onMouseEnter={() => link.submenu && setOpenSubmenu(index)}
                    onMouseLeave={() => setOpenSubmenu(null)}
                >
                    {link.submenu ? (
                        <>
                            <button
                                className={cn(
                                    fontSizeClasses[fontSize],
                                    fontWeightClasses[fontWeight],
                                    hoverClasses[hoverStyle],
                                    "flex items-center gap-1"
                                )}
                                style={{
                                    color: hoverColor && openSubmenu === index ? hoverColor : undefined
                                }}
                            >
                                {link.label}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {/* Submenu Dropdown */}
                            {openSubmenu === index && (
                                <div className="absolute left-0 top-full mt-2 bg-white border rounded-md shadow-lg py-2 min-w-[200px] z-50">
                                    {link.submenu.map((subLink, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            href={subLink.href}
                                            className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                        >
                                            {subLink.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <Link
                            href={link.href}
                            className={cn(
                                fontSizeClasses[fontSize],
                                fontWeightClasses[fontWeight],
                                hoverClasses[hoverStyle]
                            )}
                            style={{
                                color: hoverColor ? undefined : textColor,
                            }}
                        >
                            {link.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}
