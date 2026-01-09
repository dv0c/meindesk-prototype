"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { cn } from "@/lib/utils"

// Navigation link type with submenu support
interface NavLink {
    id?: string
    label: string
    href: string
    submenu?: NavLink[]
}

export interface NavigationLinksProps {
    links?: NavLink[]
    direction?: "row" | "column"
    gap?: number
    alignment?: "flex-start" | "center" | "flex-end"
    textColor?: string
    fontSize?: number
    fontWeight?: string

    style?: BlockStyle
    className?: string
}

export const NavigationLinks = defineBlock<NavigationLinksProps>({
    name: "Nav Links",
    category: "Navigation", // Assuming a category or use 'Content'
    icon: <div className="p-1">🔗</div>,

    defaultProps: {
        links: [
            { id: "nav-1", label: "Home", href: "/" },
            { id: "nav-2", label: "About", href: "/about" },
            { id: "nav-3", label: "Contact", href: "/contact" },
        ],
        direction: "row",
        gap: 24,
        alignment: "center",
        textColor: "#333333",
        fontSize: 14,
        fontWeight: "500",
        style: {},
    },

    settingsConfig: {
        links: {
            type: "array",
            label: "Navigation Links",
            arrayFields: {
                label: { type: "text", label: "Label" },
                href: { type: "text", label: "URL" },
                submenu: {
                    type: "array",
                    label: "Submenu Items",
                    arrayFields: {
                        label: { type: "text", label: "Label" },
                        href: { type: "text", label: "URL" },
                    },
                },
            },
        },
        direction: {
            type: "select",
            label: "Direction",
            options: [
                { label: "Horizontal", value: "row" },
                { label: "Vertical", value: "column" },
            ],
        },
        alignment: {
            type: "select",
            label: "Alignment",
            options: [
                { label: "Left", value: "flex-start" },
                { label: "Center", value: "center" },
                { label: "Right", value: "flex-end" },
            ],
        },
        gap: { type: "slider", label: "Gap", min: 0, max: 100 },
        textColor: { type: "color", label: "Text Color" },
        fontSize: { type: "slider", label: "Font Size", min: 10, max: 48 },
        fontWeight: {
            type: "select",
            label: "Font Weight",
            options: [
                { label: "Light", value: "300" },
                { label: "Regular", value: "400" },
                { label: "Medium", value: "500" },
                { label: "Semi Bold", value: "600" },
                { label: "Bold", value: "700" },
            ],
        },
    },

    render: ({
        links = [],
        direction = "row",
        gap = 24,
        alignment = "center",
        textColor = "#333333",
        fontSize = 14,
        fontWeight = "500",
        className = "",
        style,
    }) => {
        const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        const flexStyle: React.CSSProperties = {
            display: "flex",
            flexDirection: direction,
            justifyContent: alignment,
            alignItems: direction === "column"
                ? (alignment === "flex-start" ? "flex-start" : alignment === "flex-end" ? "flex-end" : "center")
                : "center",
            gap: `${gap}px`,
            width: "100%",
            ...computedStyle, // Merge block styles (padding, margin, etc.)
        }

        return (
            <nav className={computedClassName} style={flexStyle}>
                <ul
                    style={{
                        display: "flex",
                        flexDirection: direction,
                        gap: `${gap}px`,
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        width: direction === "column" ? "100%" : "auto",
                        alignItems: direction === "column"
                            ? (alignment === "flex-start" ? "flex-start" : alignment === "flex-end" ? "flex-end" : "center")
                            : "center",
                    }}
                >
                    {links.map((link, index) => (
                        <li
                            key={link.id || index}
                            style={{ position: "relative" }}
                            onMouseEnter={() => link.submenu && setOpenSubmenu(index)}
                            onMouseLeave={() => setOpenSubmenu(null)}
                        >
                            <a
                                href={link.href}
                                style={{
                                    color: textColor,
                                    textDecoration: "none",
                                    fontSize: `${fontSize}px`,
                                    fontWeight,
                                    transition: "opacity 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {link.label}
                                {link.submenu && link.submenu.length > 0 && (
                                    <ChevronDown size={14} style={{ opacity: 0.6 }} />
                                )}
                            </a>
                            {/* Submenu dropdown */}
                            {link.submenu && link.submenu.length > 0 && openSubmenu === index && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: direction === "row" ? "100%" : 0,
                                        left: direction === "row" ? 0 : "100%",
                                        minWidth: 180,
                                        backgroundColor: "#fff",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        borderRadius: 6,
                                        padding: "8px 0",
                                        marginTop: direction === "row" ? 4 : 0,
                                        marginLeft: direction === "column" ? 4 : 0,
                                        zIndex: 100,
                                    }}
                                >
                                    {link.submenu.map((sub, subIdx) => (
                                        <a
                                            key={sub.id || subIdx}
                                            href={sub.href}
                                            style={{
                                                display: "block",
                                                padding: "8px 16px",
                                                color: textColor,
                                                textDecoration: "none",
                                                fontSize: `${fontSize - 1}px`,
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            {sub.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        )
    }
})

export default NavigationLinks
