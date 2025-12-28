"use client"

import React, { forwardRef, useRef, useState, useEffect } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
    EditableText,
    propsToStyle,
} from "../../../lib/withCraftComponent"
import { motion, useInView, PanInfo, useAnimation } from "framer-motion"
import { useEditor } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { AnimatedNoise } from "./animated-noise"

interface Update {
    id: string
    date: string
    title: string
    note: string
}

interface UpdatesCarouselProps extends CraftComponentProps {
    sectionLabel?: string
    sectionTitle?: string
    updates?: Update[]
    autoPlayInterval?: number
    showArrows?: boolean
    showDots?: boolean
    slidesPerView?: '1' | '2' | '3'
    enableNoise?: boolean
    noiseOpacity?: number
}

function UpdateCard({
    update,
    index,
    enableNoise = false,
    noiseOpacity = 5,
}: {
    update: Update;
    index: number;
    enableNoise?: boolean;
    noiseOpacity?: number;
}) {
    return (
        <article
            className={cn(
                "group relative h-full",
                "transition-transform duration-500 ease-out",
                "hover:-translate-y-2",
            )}
        >
            <div className="relative bg-neutral-950 border border-border/50 md:border-t md:border-l md:border-r-0 md:border-b-0 p-8 h-full flex flex-col overflow-hidden">
                {enableNoise && <AnimatedNoise opacity={noiseOpacity / 100} />}
                <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                <div className="flex items-baseline justify-between mb-8">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        v. {String(index + 1).padStart(2, "0")}
                    </span>
                    <time className="font-mono text-[10px] text-muted-foreground/60">{update.date}</time>
                </div>

                <h3
                    className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4 group-hover:text-accent transition-colors duration-300"
                    style={{
                        fontFamily: "var(--design-font-heading, 'Bebas Neue', sans-serif)",
                    }}
                >
                    {update.title}
                </h3>

                <div
                    className="w-12 h-px mb-6 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: "var(--design-primary, #f97316)", opacity: 0.6 }}
                />

                <p
                    className="font-mono text-xs leading-relaxed"
                    style={{
                        fontFamily: "var(--design-font-body, monospace)",
                        color: "var(--design-neutral, #000000)",
                        opacity: 0.7,
                    }}
                >
                    {update.note}
                </p>

                <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l border-border/30" />
                </div>
            </div>

            <div
                className="absolute inset-0 -z-10 translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: "var(--design-primary, #f97316)", opacity: 0.05 }}
            />
        </article>
    )
}

const UpdatesCarouselBase = forwardRef<HTMLElement, UpdatesCarouselProps>(
    (
        {
            sectionLabel = "01 / Updates",
            sectionTitle = "LATEST RELEASES",
            updates = [],
            autoPlayInterval = 5000,
            showArrows = true,
            showDots = true,
            slidesPerView = '3',
            enableNoise = true,
            noiseOpacity = 5,
            className = "",
            ...styleProps
        },
        ref
    ) => {
        const headerRef = useRef<HTMLDivElement>(null)
        const containerRef = useRef<HTMLDivElement>(null)
        const [currentIndex, setCurrentIndex] = useState(0)
        const [cardsPerView, setCardsPerView] = useState(3)
        const [isMobile, setIsMobile] = useState(false)
        const [isDragging, setIsDragging] = useState(false)
        const controls = useAnimation()

        // Detect if we're in the editor
        const { enabled: isEditorEnabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        const headerInView = useInView(headerRef, { once: false, amount: 0.3 })

        // Detect screen size
        useEffect(() => {
            const handleResize = () => {
                const mobile = window.innerWidth < 768
                setIsMobile(mobile)

                if (mobile) {
                    setCardsPerView(1)
                } else if (window.innerWidth < 1024) {
                    setCardsPerView(Math.min(2, parseInt(slidesPerView)))
                } else {
                    setCardsPerView(parseInt(slidesPerView))
                }
            }

            handleResize()
            window.addEventListener("resize", handleResize)
            return () => window.removeEventListener("resize", handleResize)
        }, [slidesPerView])

        const maxIndex = Math.max(0, updates.length - cardsPerView)

        // Auto-play on desktop only (disabled in editor)
        useEffect(() => {
            if (isMobile || isDragging || !autoPlayInterval || isEditorEnabled || updates.length === 0) return

            const interval = setInterval(() => {
                setCurrentIndex((prev) => {
                    const next = prev + 1
                    return next > maxIndex ? 0 : next
                })
            }, autoPlayInterval)

            return () => clearInterval(interval)
        }, [cardsPerView, isDragging, maxIndex, isMobile, autoPlayInterval, isEditorEnabled, updates.length])

        // Animate to current index (desktop only, disabled in editor)
        useEffect(() => {
            if (isMobile || !containerRef.current || isEditorEnabled) return

            const itemWidth = containerRef.current.offsetWidth / cardsPerView
            const targetX = -currentIndex * itemWidth

            controls.start({
                x: targetX,
                transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                },
            })
        }, [currentIndex, controls, isMobile, isEditorEnabled, cardsPerView])

        const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            setIsDragging(false)

            if (!containerRef.current) return
            const containerWidth = containerRef.current.offsetWidth

            const offset = info.offset.x
            const velocity = info.velocity.x

            let newIndex = currentIndex

            if (Math.abs(velocity) > 300) {
                newIndex = velocity > 0 ? currentIndex - 1 : currentIndex + 1
            } else if (Math.abs(offset) > containerWidth * 0.2) {
                newIndex = offset > 0 ? currentIndex - 1 : currentIndex + 1
            }

            newIndex = Math.max(0, Math.min(newIndex, maxIndex))
            setCurrentIndex(newIndex)
        }

        const nextSlide = () => {
            setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1))
        }

        const prevSlide = () => {
            setCurrentIndex((prev) => (prev - 1 < 0 ? maxIndex : prev - 1))
        }

        const goToSlide = (index: number) => {
            setCurrentIndex(Math.min(index, maxIndex))
        }

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
            <section ref={ref} className={cn("updates-carousel-section", className)} style={sectionStyle}>
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

                {/* Mobile: Native CSS Scroll */}
                {isMobile && (
                    <div className="-mx-6">
                        <div
                            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 pb-4"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            {updates.map((update, index) => (
                                <div
                                    className="pt-4 pb-12 px-6 flex-shrink-0 w-[85vw] snap-center"
                                    key={index}
                                >
                                    <UpdateCard
                                        update={update}
                                        index={index}
                                        enableNoise={enableNoise}
                                        noiseOpacity={noiseOpacity}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Desktop: Interactive Carousel */}
                {!isMobile && (
                    <div className="relative">
                        <div
                            ref={containerRef}
                            className="overflow-hidden cursor-grab active:cursor-grabbing"
                        >
                            <motion.div
                                drag={isEditorEnabled ? false : "x"}
                                dragDirectionLock
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={handleDragEnd}
                                animate={controls}
                                className="flex"
                            >
                                {updates.map((update, index) => (
                                    <div
                                        key={update.id}
                                        className="flex-shrink-0 px-3"
                                        style={{ width: `${100 / cardsPerView}%` }}
                                    >
                                        <UpdateCard
                                            update={update}
                                            index={index}
                                            enableNoise={enableNoise}
                                            noiseOpacity={noiseOpacity}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Navigation Controls (Desktop Only) */}
                        {showArrows && (
                            <div className="flex items-center gap-4 mt-8">
                                <button
                                    onClick={prevSlide}
                                    className={cn(
                                        "group p-3 border border-border/40 transition-all duration-300 hover:border-accent",
                                    )}
                                    aria-label="Previous slide"
                                >
                                    <svg
                                        className={cn(
                                            "w-5 h-5 transition-colors duration-300 text-muted-foreground group-hover:text-accent",
                                        )}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={nextSlide}
                                    className={cn(
                                        "group p-3 border border-border/40 transition-all duration-300 hover:border-accent",
                                    )}
                                    aria-label="Next slide"
                                >
                                    <svg
                                        className={cn(
                                            "w-5 h-5 transition-colors duration-300 text-muted-foreground group-hover:text-accent",
                                        )}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Progress Dots */}
                                {showDots && (
                                    <div className="flex gap-2 ml-4">
                                        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToSlide(index)}
                                                className={cn(
                                                    "w-2 h-2 rounded-full transition-all duration-300",
                                                    index === currentIndex
                                                        ? "w-8"
                                                        : "hover:bg-border",
                                                )}
                                                style={{
                                                    backgroundColor: index === currentIndex
                                                        ? "var(--design-primary, #f97316)"
                                                        : "var(--design-neutral, #000000)",
                                                    opacity: index === currentIndex ? 1 : 0.4,
                                                }}
                                                aria-label={`Go to slide ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Counter */}
                                <div className="ml-auto font-mono text-xs text-muted-foreground">
                                    <span style={{ color: "var(--design-primary, #f97316)" }}>
                                        {String(currentIndex + 1).padStart(2, "0")}
                                    </span>
                                    {" / "}
                                    <span>{String(maxIndex + 1).padStart(2, "0")}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {updates.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Add updates to display them here
                    </div>
                )}
            </section>
        )
    }
)

UpdatesCarouselBase.displayName = "UpdatesCarouselBase"

const defaultUpdates: Update[] = [
    {
        id: '1',
        date: "2025.06.15",
        title: "Analytics Pro",
        note: "Advanced analytics with heatmaps, conversion funnels, and audience insights. Track everything.",
    },
    {
        id: '2',
        date: "2025.06.10",
        title: "RSS Scraper 2.0",
        note: "Auto-import content from any RSS feed. Schedule posts, filter by keywords.",
    },
    {
        id: '3',
        date: "2025.05.28",
        title: "Theme Marketplace",
        note: "Browse, install, and customize themes. Request custom designs.",
    },
    {
        id: '4',
        date: "2025.05.15",
        title: "SEO Builder Pro",
        note: "AI-powered meta tags, sitemap generation, and schema markup.",
    },
    {
        id: '5',
        date: "2025.04.30",
        title: "Drag-Drop Editor",
        note: "New block system with 50+ components. No code required.",
    },
]

const defaultProps: Partial<UpdatesCarouselProps> = {
    sectionLabel: "01 / Updates",
    sectionTitle: "LATEST RELEASES",
    updates: defaultUpdates,
    autoPlayInterval: 5000,
    showArrows: true,
    showDots: true,
    slidesPerView: '3',
    enableNoise: true,
    noiseOpacity: 5,
    paddingTop: 128,
    paddingBottom: 128,
}

export const UpdatesCarousel = withCraftComponent<UpdatesCarouselProps, HTMLElement>(
    UpdatesCarouselBase,
    {
        displayName: "Updates Carousel",
        defaultProps,
        sectionTitle: "Carousel Settings",
        settingsConfig: {
            sectionLabel: { type: "text", label: "Section Label" },
            sectionTitle: { type: "text", label: "Section Title" },
            autoPlayInterval: {
                type: "slider",
                label: "Auto-play Interval (ms)",
                min: 1000,
                max: 10000,
            },
            slidesPerView: {
                type: "select",
                label: "Slides Per View",
                options: [
                    { value: '1', label: '1 Slide' },
                    { value: '2', label: '2 Slides' },
                    { value: '3', label: '3 Slides' },
                ]
            },
            enableNoise: { type: "checkbox", label: "Enable Noise on Cards" },
            noiseOpacity: {
                type: "slider",
                label: "Noise Opacity (%)",
                min: 0,
                max: 20,
                step: 1,
            },
            showArrows: { type: "checkbox", label: "Show Navigation Arrows" },
            showDots: { type: "checkbox", label: "Show Dots Indicator" },
            updates: {
                type: "array",
                label: "Updates",
                arrayFields: {
                    date: { type: "text", label: "Date" },
                    title: { type: "text", label: "Title" },
                    note: { type: "textarea", label: "Description" },
                },
            },
        },
    }
)
