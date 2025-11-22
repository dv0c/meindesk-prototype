"use client"

import { useState, useEffect, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SlideshowProps {
  autoplay?: boolean
  interval?: number
  children?: ReactNode
  className?: string
  [key: string]: any
}

export default function Slideshow({ autoplay = true, interval = 3000, children, className, ...props }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const slides = children ? (Array.isArray(children) ? children : [children]) : []

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoplay, slides.length, interval])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full min-h-[300px] bg-muted/50 border-2 border-dashed rounded-lg flex items-center justify-center",
          className,
        )}
        {...props}
      >
        <p className="text-muted-foreground text-sm">Slideshow - Drop components here</p>
      </div>
    )
  }

  return (
    <div
      className={cn("relative w-full min-h-[300px] bg-muted/10 rounded-lg overflow-hidden group", className)}
      {...props}
    >
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "transition-opacity duration-500",
              index === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none",
            )}
          >
            {slide}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex ? "bg-primary w-8" : "bg-primary/50 w-2",
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
