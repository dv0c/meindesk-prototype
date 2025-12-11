"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface SplitHeroProps {
    image?: string
    imageAlt?: string
    content?: string
    imagePosition?: "left" | "right"
    backgroundColor?: string
    textColor?: string
    padding?: string
    gap?: string
    imageWidth?: string
    contentWidth?: string
    verticalAlign?: "top" | "center" | "bottom"
    className?: string
}

export default function SplitHero({
    image = "",
    imageAlt = "Hero image",
    content = "Your content here. Add multiple paragraphs separated by double line breaks.",
    imagePosition = "left",
    backgroundColor = "#E8DFD8",
    textColor = "#2C2C2C",
    padding = "80px 40px",
    gap = "60px",
    imageWidth = "45%",
    contentWidth = "55%",
    verticalAlign = "center",
    className = "",
}: SplitHeroProps) {
    const alignClasses = {
        top: "items-start",
        center: "items-center",
        bottom: "items-end",
    }

    // Convert content string with double line breaks to paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim())

    return (
        <section
            className={cn("w-full", className)}
            style={{
                backgroundColor,
                color: textColor,
                padding,
            }}
        >
            <div className="container mx-auto max-w-7xl">
                <div
                    className={cn(
                        "grid grid-cols-1 md:grid-cols-2 items-center",
                        alignClasses[verticalAlign]
                    )}
                    style={{ gap }}
                >
                    {/* Image Column */}
                    <div
                        className={cn(
                            "w-full",
                            imagePosition === "right" && "md:order-2"
                        )}
                        style={{ width: imageWidth }}
                    >
                        {image ? (
                            <div className="relative w-full aspect-[4/5] md:aspect-[3/4]">
                                <Image
                                    src={image}
                                    alt={imageAlt}
                                    fill
                                    className="object-cover rounded-sm"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-[4/5] md:aspect-[3/4] bg-gray-200 rounded-sm flex items-center justify-center">
                                <span className="text-gray-400">Add image</span>
                            </div>
                        )}
                    </div>

                    {/* Content Column */}
                    <div
                        className={cn(
                            "w-full space-y-6",
                            imagePosition === "right" && "md:order-1"
                        )}
                        style={{ width: contentWidth }}
                    >
                        {paragraphs.map((paragraph, index) => (
                            <p
                                key={index}
                                className="text-base md:text-lg leading-relaxed"
                                style={{
                                    lineHeight: "1.8",
                                    fontFamily: "Georgia, serif"
                                }}
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
