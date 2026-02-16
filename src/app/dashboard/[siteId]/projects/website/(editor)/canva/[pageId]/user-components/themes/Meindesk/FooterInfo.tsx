"use client"

import React, { forwardRef, useRef } from "react"
import {
    EditableText,
    propsToStyle,
} from "../../../lib/editor-primitives"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { defineBlock, useBlockStyles, type BlockStyle } from "@/lib/block-api"

interface FooterLink {
    id: string
    text: string
    url: string
}

interface FooterColumn {
    id: string
    title: string
    links: FooterLink[]
}

interface FooterInfoProps {
    sectionLabel?: string
    sectionTitle?: string
    columns?: FooterColumn[]
    copyrightText?: string
    taglineText?: string
    showTopBorder?: boolean
    style?: BlockStyle
    className?: string
    responsive?: { hiddenOn?: string[] }
    isEditing?: boolean
    deviceMode?: "desktop" | "tablet" | "mobile" | null
    [key: string]: any
}

const FooterInfoBase = forwardRef<HTMLElement, FooterInfoProps>(
    (
        {
            sectionLabel = "04 / Info",
            sectionTitle = "GET STARTED",
            columns = [],
            copyrightText = "© 2025 Prototype. All rights reserved.",
            taglineText = "Build your vision. Own your content.",
            showTopBorder = true,
            className = "",
            responsive,
            isEditing,
            deviceMode,
            ...styleProps
        },
        ref
    ) => {
        const headerRef = useRef<HTMLDivElement>(null)
        const gridRef = useRef<HTMLDivElement>(null)
        const footerRef = useRef<HTMLDivElement>(null)

        const headerInView = useInView(headerRef, { once: false, amount: 0.3 })
        const gridInView = useInView(gridRef, { once: false, amount: 0.3 })
        const footerInView = useInView(footerRef, { once: false, amount: 0.3 })

        const baseStyle = propsToStyle(styleProps)

        const sectionStyle: React.CSSProperties = {
            position: "relative",
            paddingTop: "8rem",
            paddingBottom: "8rem",
            paddingLeft: "clamp(1.5rem, 5vw, 7rem)",
            paddingRight: "clamp(1.5rem, 5vw, 3rem)",
            borderTop: showTopBorder ? `1px solid rgba(${parseInt((styleProps.backgroundColor as string || "#000000").slice(1, 3), 16)}, ${parseInt((styleProps.backgroundColor as string || "#000000").slice(3, 5), 16)}, ${parseInt((styleProps.backgroundColor as string || "#000000").slice(5, 7), 16)}, 0.3)` : undefined,
            backgroundColor: styleProps.backgroundColor || "transparent",
            ...baseStyle,
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: sectionStyle as any,
            className: cn("footer-info-section", className),
            responsive,
            isEditing,
            deviceMode,
        })

        return (
            <section ref={ref} className={computedClassName} style={computedStyle}>
                {/* Section header */}
                <motion.div
                    ref={headerRef}
                    initial={{ x: -60, opacity: 0 }}
                    animate={headerInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16"
                >
                    <EditableText
                        propName="sectionLabel"
                        value={sectionLabel}
                        as="span"
                        style={{
                            fontFamily: "var(--design-font-body, monospace)",
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.3em",
                            color: "var(--design-primary, #f97316)",
                        }}
                    />
                    <EditableText
                        propName="sectionTitle"
                        value={sectionTitle}
                        as="h2"
                        style={{
                            marginTop: "1rem",
                            fontFamily: "var(--design-font-heading, 'Bebas Neue', sans-serif)",
                            fontSize: "clamp(3rem, 7vw, 5rem)",
                            letterSpacing: "-0.02em",
                            color: "var(--design-neutral, #000000)",
                            fontWeight: "var(--design-font-weight-heading, 400)",
                        }}
                    />
                </motion.div>

                {/* Multi-column layout */}
                <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
                    {columns.map((column: FooterColumn, index: number) => (
                        <motion.div
                            key={column.id}
                            initial={{ y: 40, opacity: 0 }}
                            animate={gridInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="col-span-1"
                        >
                            <h4
                                className="font-mono text-[9px] uppercase tracking-[0.3em] mb-4"
                                style={{
                                    color: "var(--design-neutral, #000000)",
                                    opacity: 0.6,
                                }}
                            >
                                {column.title}
                            </h4>
                            <ul className="space-y-2">
                                {column.links.map((link: FooterLink) => (
                                    <li key={link.id}>
                                        {link.url ? (
                                            <a
                                                href={link.url}
                                                className="font-mono text-xs transition-colors duration-200"
                                                style={{
                                                    fontFamily: "var(--design-font-body, monospace)",
                                                    color: "var(--design-neutral, #000000)",
                                                    opacity: 0.8,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = "var(--design-primary, #f97316)"
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = "var(--design-neutral, #000000)"
                                                }}
                                            >
                                                {link.text}
                                            </a>
                                        ) : (
                                            <span
                                                className="font-mono text-xs"
                                                style={{
                                                    fontFamily: "var(--design-font-body, monospace)",
                                                    color: "var(--design-neutral, #000000)",
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {link.text}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {columns.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Add footer columns to display them here
                    </div>
                )}

                {/* Bottom copyright */}
                <motion.div
                    ref={footerRef}
                    initial={{ y: 20, opacity: 0 }}
                    animate={footerInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-24 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    style={{
                        borderTop: `1px solid`,
                        borderColor: "var(--design-neutral, #000000)",
                    }}
                >
                    <EditableText
                        propName="copyrightText"
                        value={copyrightText}
                        as="p"
                        style={{
                            fontFamily: "var(--design-font-body, monospace)",
                            fontSize: "10px",
                            color: "var(--design-neutral, #000000)",
                            opacity: 0.6,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                        }}
                    />
                    <EditableText
                        propName="taglineText"
                        value={taglineText}
                        as="p"
                        style={{
                            fontFamily: "var(--design-font-body, monospace)",
                            fontSize: "10px",
                            color: "var(--design-neutral, #000000)",
                            opacity: 0.6,
                        }}
                    />
                </motion.div>
            </section>
        )
    }
)

FooterInfoBase.displayName = "FooterInfoBase"

const defaultColumns: FooterColumn[] = [
    {
        id: '1',
        title: "Product",
        links: [
            { id: '1-1', text: "Blog Builder", url: "#" },
            { id: '1-2', text: "CMS Platform", url: "#" },
            { id: '1-3', text: "RSS Scraper", url: "#" },
        ],
    },
    {
        id: '2',
        title: "Features",
        links: [
            { id: '2-1', text: "Drag & Drop", url: "#" },
            { id: '2-2', text: "SEO Tools", url: "#" },
            { id: '2-3', text: "Analytics", url: "#" },
            { id: '2-4', text: "Theme Store", url: "#" },
        ],
    },
    {
        id: '3',
        title: "Pricing",
        links: [
            { id: '3-1', text: "Free Tier", url: "#" },
            { id: '3-2', text: "Pro Plan", url: "#" },
            { id: '3-3', text: "Enterprise", url: "#" },
        ],
    },
    {
        id: '4',
        title: "Resources",
        links: [
            { id: '4-1', text: "Documentation", url: "#" },
            { id: '4-2', text: "API Reference", url: "#" },
        ],
    },
    {
        id: '5',
        title: "Contact",
        links: [
            { id: '5-1', text: "Email", url: "mailto:hello@prototype.app" },
            { id: '5-2', text: "Twitter/X", url: "#" },
        ],
    },
    {
        id: '6',
        title: "Support",
        links: [
            { id: '6-1', text: "Help Center", url: "#" },
            { id: '6-2', text: "Community", url: "#" },
        ],
    },
]

const defaultProps: Partial<FooterInfoProps> = {
    sectionLabel: "04 / Info",
    sectionTitle: "GET STARTED",
    columns: defaultColumns,
    copyrightText: "© 2025 Prototype. All rights reserved.",
    taglineText: "Build your vision. Own your content.",
    showTopBorder: true,
    paddingTop: 128,
    paddingBottom: 128,
    responsive: { hiddenOn: [] },
}

export const FooterInfo = defineBlock<FooterInfoProps>({
    name: "FooterInfo",
    category: "Meindesk Theme",
    description: "Footer columns and metadata",
    defaultProps,
    settingsConfig: {
        sectionLabel: { type: "text", label: "Section Label" },
        sectionTitle: { type: "text", label: "Section Title" },
        copyrightText: { type: "text", label: "Copyright Text" },
        taglineText: { type: "text", label: "Tagline Text" },
        showTopBorder: { type: "checkbox", label: "Show Top Border" },
        columns: {
            type: "array",
            label: "Footer Columns",
            arrayFields: {
                title: { type: "text", label: "Column Title" },
                links: {
                    type: "array",
                    label: "Links",
                    arrayFields: {
                        text: { type: "text", label: "Link Text" },
                        url: { type: "text", label: "Link URL" },
                    },
                },
            },
        },
    },
    render: (props) => <FooterInfoBase {...props} />,
})
