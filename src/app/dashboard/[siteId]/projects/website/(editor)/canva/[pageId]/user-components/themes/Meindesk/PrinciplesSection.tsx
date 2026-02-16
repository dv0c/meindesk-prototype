"use client"

import React, { forwardRef, useRef } from "react"
import {
    EditableText,
    propsToStyle,
} from "../../../lib/editor-primitives"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { defineBlock, useBlockStyles, type BlockStyle } from "@/lib/block-api"

interface Principle {
    id: string
    number: string
    title: string
    highlightedWord: string
    description: string
    align: 'left' | 'right'
}

interface PrinciplesSectionProps {
    sectionLabel?: string
    sectionTitle?: string
    principles?: Principle[]
    style?: BlockStyle
    className?: string
    responsive?: { hiddenOn?: string[] }
    isEditing?: boolean
    deviceMode?: "desktop" | "tablet" | "mobile" | null
    [key: string]: any
}

// HighlightText component with parallax effect
function HighlightText({ children, parallaxSpeed = 0.6 }: { children: React.ReactNode, parallaxSpeed?: number }) {
    const containerRef = useRef<HTMLSpanElement>(null)
    const isInView = useInView(containerRef, { once: false, amount: 0.5 })

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const yParallax = useTransform(scrollYProgress, [0, 1], [0, -20 * parallaxSpeed])

    return (
        <span ref={containerRef} className="relative inline-block">
            <motion.span
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    y: yParallax,
                    transformOrigin: "left center",
                    position: "absolute",
                    inset: "0",
                    left: "-0.1em",
                    right: "-0.1em",
                    top: "0.15em",
                    bottom: "0.1em",
                    backgroundColor: "var(--design-primary, #f97316)",
                }}
            />
            <motion.span
                initial={{ color: "var(--design-neutral, #ffffff)" }}
                animate={isInView ? { color: "var(--design-background, #000000)" } : { color: "var(--design-neutral, #ffffff)" }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
            >
                {children}
            </motion.span>
        </span>
    )
}

function PrincipleItem({ principle }: { principle: Principle }) {
    const ref = useRef<HTMLElement>(null)
    const isInView = useInView(ref, { once: false, amount: 0.3 })
    const isRight = principle.align === "right"

    return (
        <motion.article
            ref={ref}
            initial={{ x: isRight ? 80 : -80, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: isRight ? 80 : -80, opacity: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col ${isRight ? "items-end text-right" : "items-start text-left"}`}
        >
            <span
                className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4"
                style={{ color: "var(--design-neutral, #000000)", opacity: 0.6 }}
            >
                {principle.number} / {principle.title.split(" ")[0]}
            </span>

            <h3
                className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none"
                style={{
                    fontFamily: "var(--design-font-heading, 'Bebas Neue', sans-serif)",
                    color: "var(--design-neutral, #000000)",
                    fontWeight: "var(--design-font-weight-heading, 400)",
                }}
            >
                {principle.title.split(principle.highlightedWord).map((part, index, arr) => (
                    <React.Fragment key={index}>
                        <span>{part}</span>
                        {index < arr.length - 1 && (
                            <HighlightText parallaxSpeed={0.6}>
                                {principle.highlightedWord}
                            </HighlightText>
                        )}
                    </React.Fragment>
                ))}
            </h3>

            <p
                className="mt-6 max-w-md font-mono text-sm leading-relaxed"
                style={{
                    fontFamily: "var(--design-font-body, monospace)",
                    color: "var(--design-neutral, #000000)",
                    opacity: 0.7,
                }}
            >
                {principle.description}
            </p>

            <div
                className={`mt-8 h-[1px] w-24 md:w-48 ${isRight ? "mr-0" : "ml-0"}`}
                style={{ backgroundColor: "var(--design-neutral, #000000)", opacity: 0.2 }}
            />
        </motion.article>
    )
}

const PrinciplesSectionBase = forwardRef<HTMLElement, PrinciplesSectionProps>(
    (
        {
            sectionLabel = "03 / Philosophy",
            sectionTitle = "WHY PROTOTYPE",
            principles = [],
            className = "",
            responsive,
            isEditing,
            deviceMode,
            ...styleProps
        },
        ref
    ) => {
        const headerRef = useRef<HTMLDivElement>(null)
        const headerInView = useInView(headerRef, { once: false, amount: 0.3 })

        const baseStyle = propsToStyle(styleProps)

        const sectionStyle: React.CSSProperties = {
            position: "relative",
            paddingTop: "8rem",
            paddingBottom: "8rem",
            paddingLeft: "clamp(1.5rem, 5vw, 7rem)",
            paddingRight: "clamp(1.5rem, 5vw, 3rem)",
            backgroundColor: styleProps.backgroundColor || "transparent",
            ...baseStyle,
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: sectionStyle as any,
            className: cn("principles-section", className),
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
                    className="mb-24"
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

                {/* Staggered principles */}
                <div className="space-y-24 md:space-y-32">
                    {principles.map((principle: Principle) => (
                        <PrincipleItem key={principle.id} principle={principle} />
                    ))}
                </div>

                {principles.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Add principles to display them here
                    </div>
                )}
            </section>
        )
    }
)

PrinciplesSectionBase.displayName = "PrinciplesSectionBase"

const defaultPrinciples: Principle[] = [
    {
        id: '1',
        number: "01",
        title: "ZERO CODE REQUIRED",
        highlightedWord: "ZERO",
        description: "Build complete websites without touching code. Our visual editor handles everything.",
        align: "left",
    },
    {
        id: '2',
        number: "02",
        title: "TOTAL CUSTOMIZATION",
        highlightedWord: "TOTAL",
        description: "Modify themes, layouts, and styles. Your site, your way. No restrictions.",
        align: "right",
    },
    {
        id: '3',
        number: "03",
        title: "CONTENT FREEDOM",
        highlightedWord: "FREEDOM",
        description: "Import RSS feeds, export your data, own your content. You're never locked in.",
        align: "left",
    },
    {
        id: '4',
        number: "04",
        title: "SCALE AFFORDABLY",
        highlightedWord: "AFFORDABLY",
        description: "Generous free tier to start. Upgrade only when your audience grows. Fair pricing always.",
        align: "right",
    },
]

const defaultProps: Partial<PrinciplesSectionProps> = {
    sectionLabel: "03 / Philosophy",
    sectionTitle: "WHY PROTOTYPE",
    principles: defaultPrinciples,
    paddingTop: 128,
    paddingBottom: 128,
    responsive: { hiddenOn: [] },
}

export const PrinciplesSection = defineBlock<PrinciplesSectionProps>({
    name: "PrinciplesSection",
    category: "Meindesk Theme",
    description: "Philosophy section with highlighted text",
    defaultProps,
    settingsConfig: {
        sectionLabel: { type: "text", label: "Section Label" },
        sectionTitle: { type: "text", label: "Section Title" },
        principles: {
            type: "array",
            label: "Principles",
            arrayFields: {
                number: { type: "text", label: "Number" },
                title: { type: "text", label: "Title" },
                highlightedWord: { type: "text", label: "Highlighted Word" },
                description: { type: "textarea", label: "Description" },
                align: { type: "select", label: "Alignment", options: [{ label: "Left", value: "left" }, { label: "Right", value: "right" }] },
            },
        },
    },
    render: (props) => <PrinciplesSectionBase {...props} />,
})
