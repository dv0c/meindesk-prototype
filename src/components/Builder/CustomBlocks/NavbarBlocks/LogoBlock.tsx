"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoBlockProps {
    logoImage?: string
    logoText?: string
    logoSize?: "sm" | "md" | "lg"
    href?: string
    align?: "left" | "center" | "right"
    marginLeft?: string
    marginRight?: string
    className?: string
}

export default function LogoBlock({
    logoImage = "",
    logoText = "Brand",
    logoSize = "md",
    href = "/",
    align = "left",
    marginLeft = "0",
    marginRight = "auto",
    className = "",
}: LogoBlockProps) {
    const sizeClasses = {
        sm: "h-8",
        md: "h-10",
        lg: "h-12",
    }

    const textSizes = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
    }

    const alignClasses = {
        left: "mr-auto",
        center: "mx-auto",
        right: "ml-auto",
    }

    const content = logoImage ? (
        <div className={`relative ${sizeClasses[logoSize]} aspect-auto`}>
            <Image
                src={logoImage}
                alt={logoText}
                width={120}
                height={40}
                className="object-contain h-full w-auto"
            />
        </div>
    ) : (
        <span className={`font-bold ${textSizes[logoSize]}`}>
            {logoText}
        </span>
    )

    return (
        <Link
            href={href}
            className={cn("flex items-center", alignClasses[align], className)}
            style={{
                marginLeft: marginLeft !== "0" ? marginLeft : undefined,
                marginRight: marginRight !== "auto" ? marginRight : undefined,
            }}
        >
            {content}
        </Link>
    )
}
