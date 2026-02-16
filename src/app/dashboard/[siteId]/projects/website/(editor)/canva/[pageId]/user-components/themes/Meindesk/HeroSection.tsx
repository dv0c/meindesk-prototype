"use client"

import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform } from "framer-motion"
import React, { forwardRef, useRef } from "react"
import {
    CraftComponentProps,
    EditableText,
    propsToStyle,
    withCraftComponent,
} from "../../../lib/withCraftComponent"
import { BackgroundOverlay } from "./BackgroundOverlay"
import { BitmapChevron } from "./bitmap-chevron"
import { ScrambleTextOnHover } from "./scramble-text"
import { SplitFlapAudioProvider, SplitFlapMuteToggle, SplitFlapText } from "./split-flap-text"
import { AnimatedNoise } from "./animated-noise"

interface HeroSectionProps extends CraftComponentProps {
    mainTitle?: string
    subtitle?: string
    description?: string
    primaryButtonText?: string
    primaryButtonLink?: string
    secondaryButtonText?: string
    secondaryButtonLink?: string
    leftLabel?: string
    infoTag?: string
    enableParallax?: boolean
    enableSplitFlap?: boolean
    enableScramble?: boolean
    enableNoise?: boolean
    noiseOpacity?: number
    splitFlapSpeed?: number
    minHeight?: string
}

const HeroSectionBase = forwardRef<HTMLElement, HeroSectionProps>(
    (
        {
            mainTitle = "PROTOTYPE",
            subtitle = "Drag-Drop Blog Builder & CMS Platform",
            description = "Build stunning blogs with our intuitive CMS. RSS scraping, SEO tools, custom themes, and complete control. Start free, scale as you grow.",
            primaryButtonText = "Start Building",
            primaryButtonLink = "#features",
            secondaryButtonText = "Latest Updates",
            secondaryButtonLink = "#updates",
            leftLabel = "BUILD",
            infoTag = "Free Tier / Always Available",
            enableParallax = true,
            enableSplitFlap = true,
            enableScramble = true,
            enableNoise = true,
            noiseOpacity = 5,
            splitFlapSpeed = 1,
            minHeight = "100vh",
            className = "",
            ...styleProps
        },
        ref
    ) => {
        const sectionRef = useRef<HTMLElement>(null)

        // Parallax scroll effect
        const { scrollYProgress } = useScroll({
            target: sectionRef,
            offset: ["start start", "end start"]
        })

        const y = useTransform(scrollYProgress, [0, 1], [0, -100])
        const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

        const baseStyle = propsToStyle(styleProps)

        const sectionStyle: React.CSSProperties = {
            position: "relative",
            minHeight,
            display: "flex",
            alignItems: "center",
            paddingLeft: "clamp(1.5rem, 5vw, 7rem)",
            paddingRight: "clamp(1.5rem, 5vw, 3rem)",
            backgroundColor: styleProps.backgroundColor || "var(--design-background, transparent)",
            ...baseStyle,
        }

        return (
            <section
                ref={(el) => {
                    if (typeof ref === 'function') {
                        ref(el)
                    } else if (ref) {
                        ref.current = el
                    }
                    (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el
                }}
                className={cn("hero-section", className)}
                style={sectionStyle}
            >
                {/* Animated Noise Background */}
                {enableNoise && <AnimatedNoise opacity={noiseOpacity / 100} />}

                {/* Left vertical label */}
                {leftLabel && (
                    <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2">
                        <EditableText
                            propName="leftLabel"
                            value={leftLabel}
                            as="span"
                            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap"
                        />
                    </div>
                )}

                {/* Main content */}
                <motion.div
                    style={enableParallax ? { y, opacity } : {}}
                    className="flex-1 w-full relative z-10"
                >
                    {/* Main Title with Split-Flap Animation */}
                    {enableSplitFlap ? (
                        <SplitFlapAudioProvider>
                            <div className="relative">
                                <SplitFlapText text={mainTitle} speed={splitFlapSpeed} />
                                <div className="mt-4">
                                    <SplitFlapMuteToggle />
                                </div>
                            </div>
                        </SplitFlapAudioProvider>
                    ) : (
                        <EditableText
                            propName="mainTitle"
                            value={mainTitle}
                            as="h1"
                            style={{
                                fontFamily: "var(--design-font-heading, 'Bebas Neue', sans-serif)",
                                fontSize: "clamp(5rem, 18vw, 18rem)",
                                lineHeight: 0.9,
                                letterSpacing: "0.02em",
                                fontWeight: "var(--design-font-weight-heading, 400)",
                                color: "var(--design-primary, #f97316)",
                            }}
                        />
                    )}

                    {/* Subtitle */}
                    <EditableText
                        propName="subtitle"
                        value={subtitle}
                        as="h2"
                        style={{
                            fontFamily: "var(--design-font-heading, 'Bebas Neue', sans-serif)",
                            color: "var(--design-neutral, #000000)",
                            opacity: 0.6,
                            fontSize: "clamp(1rem, 3vw, 2rem)",
                            marginTop: enableSplitFlap ? "1rem" : "1rem",
                            letterSpacing: "0.05em",
                        }}
                    />

                    {/* Description */}
                    <EditableText
                        propName="description"
                        value={description}
                        as="p"
                        style={{
                            marginTop: "3rem",
                            maxWidth: "28rem",
                            fontFamily: "var(--design-font-body, monospace)",
                            fontSize: "0.875rem",
                            color: "var(--design-neutral, #000000)",
                            opacity: 0.7,
                            lineHeight: 1.7,
                        }}
                    />

                    {/* Call-to-action buttons */}
                    <div className="mt-16 flex items-center gap-8 flex-wrap">
                        <a
                            href={primaryButtonLink}
                            {...(primaryButtonLink?.startsWith('http') ? {
                                target: "_blank",
                                rel: "noopener noreferrer"
                            } : {})}
                            className="group inline-flex items-center gap-3 border px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all duration-200 hover:scale-105"
                            style={{
                                borderColor: "var(--design-neutral, #000000)",
                                color: "var(--design-neutral, #000000)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "var(--design-primary, #f97316)"
                                e.currentTarget.style.color = "var(--design-primary, #f97316)"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--design-neutral, #000000)"
                                e.currentTarget.style.color = "var(--design-neutral, #000000)"
                            }}
                        >
                            {enableScramble ? (
                                <>
                                    <ScrambleTextOnHover text={primaryButtonText} as="span" duration={0.6} />
                                    <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
                                </>
                            ) : (
                                <>
                                    <EditableText
                                        propName="primaryButtonText"
                                        value={primaryButtonText}
                                        as="span"
                                    />
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </a>

                        <a
                            href={secondaryButtonLink}
                            {...(secondaryButtonLink?.startsWith('http') ? {
                                target: "_blank",
                                rel: "noopener noreferrer"
                            } : {})}
                            className="font-mono text-xs uppercase tracking-widest transition-colors duration-200"
                            style={{
                                color: "var(--design-neutral, #000000)",
                                opacity: 0.6,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "1"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "0.6"
                            }}
                        >
                            <EditableText
                                propName="secondaryButtonText"
                                value={secondaryButtonText}
                                as="span"
                            />
                        </a>
                    </div>
                </motion.div>

                {/* Floating info tag */}
                {infoTag && (
                    <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
                        <div
                            className="border px-4 py-2 font-mono text-[10px] uppercase tracking-widest"
                            style={{
                                borderColor: "var(--design-neutral, #000000)",
                                color: "var(--design-neutral, #000000)",
                                opacity: 0.6,
                            }}
                        >
                            <EditableText
                                propName="infoTag"
                                value={infoTag}
                                as="span"
                            />
                        </div>
                    </div>
                )}
            </section>
        )
    }
)

HeroSectionBase.displayName = "HeroSectionBase"

const defaultProps: Partial<HeroSectionProps> = {
    mainTitle: "BUILD YOUR VISION",
    subtitle: "Prototype",
    description: "Create stunning blogs with our drag-and-drop CMS. No code required.",
    primaryButtonText: "Start Building",
    primaryButtonLink: "#features",
    secondaryButtonText: "View Demo",
    secondaryButtonLink: "#updates",
    leftLabel: "BUILD",
    infoTag: "Free Tier / Always Available",
    enableParallax: true,
    enableSplitFlap: true,
    enableScramble: true,
    enableNoise: true,
    noiseOpacity: 5,
    splitFlapSpeed: 50,
    minHeight: "100vh",
    paddingTop: 0,
    paddingBottom: 0,
}

export const HeroSection = withCraftComponent<HeroSectionProps, HTMLElement>(
    HeroSectionBase,
    {
        displayName: "Hero Section",
        defaultProps,
        sectionTitle: "Hero Settings",
        settingsConfig: {
            mainTitle: { type: "text", label: "Main Title" },
            subtitle: { type: "text", label: "Subtitle" },
            description: { type: "textarea", label: "Description" },
            primaryButtonText: { type: "text", label: "Primary Button Text" },
            primaryButtonLink: { type: "text", label: "Primary Button Link" },
            secondaryButtonText: { type: "text", label: "Secondary Button Text" },
            secondaryButtonLink: { type: "text", label: "Secondary Button Link" },
            leftLabel: { type: "text", label: "Left Vertical Label" },
            infoTag: { type: "text", label: "Info Tag Text" },
            minHeight: { type: "text", label: "Min Height" },
            enableParallax: { type: "checkbox", label: "Enable Parallax Effect" },
            enableSplitFlap: { type: "checkbox", label: "Enable Split-Flap Title" },
            enableScramble: { type: "checkbox", label: "Enable Scramble on Button" },
            enableNoise: { type: "checkbox", label: "Enable Noise Animation" },
            noiseOpacity: {
                type: "slider",
                label: "Noise Opacity (%)",
                min: 0,
                max: 20,
                step: 1,
            },
            splitFlapSpeed: {
                type: "slider",
                label: "Split-Flap Speed (ms)",
                min: 10,
                max: 200,
                step: 5
            },
        },
    }
)
