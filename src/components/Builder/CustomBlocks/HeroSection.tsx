"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
    heading?: string
    subheading?: string
    headingSize?: "sm" | "md" | "lg" | "xl"
    textAlign?: "left" | "center" | "right"
    backgroundColor?: string
    backgroundImage?: string
    textColor?: string
    padding?: string
    minHeight?: string
    showButton?: boolean
    buttonText?: string
    buttonHref?: string
    buttonVariant?: "default" | "secondary" | "outline"
    className?: string
}

export default function HeroSection({
    heading = "Welcome",
    subheading = "Your subtitle here",
    headingSize = "xl",
    textAlign = "center",
    backgroundColor = "#F5F3F0",
    backgroundImage,
    textColor = "#2C2C2C",
    padding = "80px 24px",
    minHeight = "400px",
    showButton = false,
    buttonText = "Get Started",
    buttonHref = "#",
    buttonVariant = "default",
    className = "",
}: HeroSectionProps) {
    const headingSizes = {
        sm: "text-3xl md:text-4xl",
        md: "text-4xl md:text-5xl",
        lg: "text-5xl md:text-6xl",
        xl: "text-6xl md:text-7xl",
    }

    const alignmentClasses = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end",
    }

    return (
        <section
            className={cn("w-full flex flex-col justify-center", alignmentClasses[textAlign], className)}
            style={{
                backgroundColor: backgroundImage ? undefined : backgroundColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: textColor,
                padding,
                minHeight,
            }}
        >
            <div className="container mx-auto max-w-4xl">
                <h1 className={cn("font-bold mb-4", headingSizes[headingSize])}>
                    {heading}
                </h1>

                {subheading && (
                    <h2 className="text-xl md:text-2xl mb-8 opacity-90">
                        {subheading}
                    </h2>
                )}

                {showButton && (
                    <Button asChild variant={buttonVariant} size="lg">
                        <Link href={buttonHref}>{buttonText}</Link>
                    </Button>
                )}
            </div>
        </section>
    )
}
