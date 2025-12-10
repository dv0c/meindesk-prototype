"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageGridProps {
    images?: any[] // Accept flexible types (strings or objects) for robustness
    columns?: number
    gap?: number
    aspectRatio?: "square" | "video" | "portrait" | "auto"
    className?: string
}

export default function ImageGrid({
    images = [],
    columns = 3,
    gap = 4,
    aspectRatio = "square",
    className,
}: ImageGridProps) {
    // Safe fallback for grid columns class
    const getGridCols = (cols: number) => {
        switch (cols) {
            case 1:
                return "grid-cols-1"
            case 2:
                return "grid-cols-1 sm:grid-cols-2"
            case 3:
                return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            case 4:
                return "grid-cols-2 md:grid-cols-4"
            case 5:
                return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            case 6:
                return "grid-cols-3 md:grid-cols-6"
            default:
                return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }
    }

    const getAspectRatio = (ratio: string) => {
        switch (ratio) {
            case "square":
                return "aspect-square"
            case "video":
                return "aspect-video"
            case "portrait":
                return "aspect-[3/4]"
            case "auto":
            default:
                return ""
        }
    }

    if (!images || images.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">No images selected. Add images to see the grid.</p>
            </div>
        )
    }

    return (
        <div
            className={cn("grid", getGridCols(columns), className)}
            style={{ gap: `${gap * 0.25}rem` }}
        >
            {images.map((item, index) => {
                const src = typeof item === 'string' ? item : item.src || "/placeholder.svg"
                return (
                    <div key={index} className={cn("relative overflow-hidden rounded-lg group", getAspectRatio(aspectRatio))}>
                        {aspectRatio === "auto" ? (
                            <img
                                src={src}
                                alt={`Grid image ${index + 1}`}
                                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                            />
                        ) : (
                            <Image
                                src={src}
                                alt={`Grid image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
