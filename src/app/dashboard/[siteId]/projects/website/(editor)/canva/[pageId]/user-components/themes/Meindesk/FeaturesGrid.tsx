"use client"

import React, { forwardRef, useRef } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
    EditableText,
    propsToStyle,
} from "../../../lib/withCraftComponent"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface Feature {
    id: string
    title: string
    medium: string
    description: string
    colSpan: '1' | '2'
    rowSpan: '1' | '2'
}

interface FeaturesGridProps extends CraftComponentProps {
    sectionLabel?: string
    sectionTitle?: string
    sectionDescription?: string
    features?: Feature[]
}

const FeaturesGridBase = forwardRef<HTMLElement, FeaturesGridProps>(
    (
        {
            sectionLabel = "02 / Features",
            sectionTitle = "POWERFUL TOOLS",
            sectionDescription = "Everything you need to build, manage, and grow your blog or website.",
            features = [],
            className = "",
            ...styleProps
        },
        ref
    ) => {
        const headerRef = useRef<HTMLDivElement>(null)
        const gridRef = useRef<HTMLDivElement>(null)

        const headerInView = useInView(headerRef, { once: false, amount: 0.3 })
        const gridInView = useInView(gridRef, { once: false, amount: 0.2 })

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

        return (
            <section ref={ref} className={cn("features-grid-section", className)} style={sectionStyle}>
                {/* Section header */}
                <motion.div
                    ref={headerRef}
                    initial={{ x: -60, opacity: 0 }}
                    animate={headerInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 flex items-end justify-between"
                >
                    <div>
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
                    </div>
                    <EditableText
                        propName="sectionDescription"
                        value={sectionDescription}
                        as="p"
                        className="hidden md:block max-w-xs text-right leading-relaxed"
                        style={{
                            fontFamily: "var(--design-font-body, monospace)",
                            fontSize: "0.75rem",
                            color: "var(--design-neutral, #000000)",
                            opacity: 0.6,
                        }}
                    />
                </motion.div>

                {/* Asymmetric grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[200px]"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            initial={{ y: 60, opacity: 0 }}
                            animate={gridInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <FeatureCard feature={feature} index={index} />
                        </motion.div>
                    ))}
                </div>

                {features.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Add features to display them here
                    </div>
                )}
            </section>
        )
    }
)

FeaturesGridBase.displayName = "FeaturesGridBase"

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
    const [isHovered, setIsHovered] = React.useState(false)
    const cardRef = useRef<HTMLElement>(null)
    const isInView = useInView(cardRef, { once: true, amount: 0.5 })
    const persistHover = index === 0 // First item always active
    const isScrollActive = persistHover && isInView

    const isActive = isHovered || isScrollActive

    const spanClass = `col-span-${feature.colSpan} row-span-${feature.rowSpan}`

    return (
        <article
            ref={cardRef}
            className={cn(
                "group relative border p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
                spanClass,
                isActive && "border-accent/60",
            )}
            style={{
                borderColor: isActive ? undefined : "var(--design-neutral, #000000)",
                opacity: isActive ? 1 : 0.4,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-0",
                )}
                style={{ backgroundColor: "var(--design-primary, #f97316)", opacity: isActive ? 0.05 : 0 }}
            />

            <div className="relative z-10">
                <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--design-neutral, #000000)", opacity: 0.6 }}
                >
                    {feature.medium}
                </span>
                <h3
                    className={cn(
                        "mt-3 font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight transition-colors duration-300"
                    )}
                    style={{
                        fontFamily: "var(--design-font-heading, 'Bebas Neue', sans-serif)",
                        color: isActive ? "var(--design-primary, #f97316)" : "var(--design-neutral, #000000)",
                    }}
                >
                    {feature.title}
                </h3>
            </div>

            <div className="relative z-10">
                <p
                    className={cn(
                        "font-mono text-xs leading-relaxed transition-all duration-500 max-w-[280px]",
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                    )}
                    style={{
                        fontFamily: "var(--design-font-body, monospace)",
                        color: "var(--design-neutral, #000000)",
                        opacity: isActive ? 0.7 : 0,
                    }}
                >
                    {feature.description}
                </p>
            </div>

            <span
                className={cn(
                    "absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300",
                )}
                style={{
                    color: isActive ? "var(--design-primary, #f97316)" : "var(--design-neutral, #000000)",
                    opacity: isActive ? 1 : 0.4,
                }}
            >
                {String(index + 1).padStart(2, "0")}
            </span>

            <div
                className={cn(
                    "absolute top-0 right-0 w-12 h-12 transition-all duration-500",
                    isActive ? "opacity-100" : "opacity-0",
                )}
            >
                <div
                    className="absolute top-0 right-0 w-full h-[1px]"
                    style={{ backgroundColor: "var(--design-primary, #f97316)" }}
                />
                <div
                    className="absolute top-0 right-0 w-[1px] h-full"
                    style={{ backgroundColor: "var(--design-primary, #f97316)" }}
                />
            </div>
        </article>
    )
}

const defaultFeatures: Feature[] = [
    {
        id: '1',
        title: "Drag & Drop Editor",
        medium: "Core Feature",
        description: "Visual block-based editor. Build pages without writing code. 50+ components included.",
        colSpan: '2',
        rowSpan: '2',
    },
    {
        id: '2',
        title: "RSS Scraper",
        medium: "Content Import",
        description: "Auto-import content from any RSS feed. Set schedules and filters.",
        colSpan: '1',
        rowSpan: '1',
    },
    {
        id: '3',
        title: "SEO Builder",
        medium: "Optimization",
        description: "AI meta tags, sitemaps, schema markup. Rank higher, grow faster.",
        colSpan: '1',
        rowSpan: '2',
    },
    {
        id: '4',
        title: "Analytics",
        medium: "Insights",
        description: "Real-time visitor tracking, engagement metrics, and performance reports. Know your audience.",
        colSpan: '1',
        rowSpan: '1',
    },
    {
        id: '5',
        title: "Theme Store",
        medium: "Customization",
        description: "Install themes instantly. Request custom designs from our team.",
        colSpan: '1',
        rowSpan: '1',
    },
    {
        id: '6',
        title: "Free Forever Tier",
        medium: "Pricing",
        description: "Start building today. No credit card required. Upgrade when you're ready.",
        colSpan: '2',
        rowSpan: '1',
    },
    {
        id: '7',
        title: "Full Control",
        medium: "Flexibility",
        description: "Modify everything. Export your data. Your content, your rules.",
        colSpan: '1',
        rowSpan: '1',
    },
]

const defaultProps: Partial<FeaturesGridProps> = {
    sectionLabel: "02 / Features",
    sectionTitle: "POWERFUL TOOLS",
    sectionDescription: "Everything you need to build, manage, and grow your blog or website.",
    features: defaultFeatures,
    paddingTop: 128,
    paddingBottom: 128,
}

export const FeaturesGrid = withCraftComponent<FeaturesGridProps, HTMLElement>(
    FeaturesGridBase,
    {
        displayName: "Features Grid",
        defaultProps,
        sectionTitle: "Features Settings",
        settingsConfig: {
            sectionLabel: { type: "text", label: "Section Label" },
            sectionTitle: { type: "text", label: "Section Title" },
            sectionDescription: { type: "textarea", label: "Section Description" },
            features: {
                type: "array",
                label: "Features",
                arrayFields: {
                    title: { type: "text", label: "Title" },
                    medium: { type: "text", label: "Category" },
                    description: { type: "textarea", label: "Description" },
                    colSpan: {
                        type: "select",
                        label: "Column Span",
                        options: [
                            { label: "1 Column", value: "1" },
                            { label: "2 Columns", value: "2" },
                        ],
                    },
                    rowSpan: {
                        type: "select",
                        label: "Row Span",
                        options: [
                            { label: "1 Row", value: "1" },
                            { label: "2 Rows", value: "2" },
                        ],
                    },
                },
            },
        },
    }
)
