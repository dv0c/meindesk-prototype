import React, { useState, useEffect } from 'react'
import { defineBlock, useBlockStyles, BlockStyle } from '@/lib/block-api'
import {
    Carousel as UICarousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi
} from '@/components/ui/carousel'
import { cn } from "@/lib/utils"

interface Slide {
    id: string
    image?: string
    title?: string
    description?: string
}

export interface CarouselProps {
    slides?: Slide[]
    loop?: boolean
    showArrows?: boolean
    showDots?: boolean
    slidesPerView?: '1' | '2' | '3' | '4'
    width?: string | number
    height?: string | number
    paddingTop?: number | string
    paddingBottom?: number | string
    style?: BlockStyle
    className?: string
}

const CarouselDots = ({ api, count }: { api: CarouselApi | undefined, count: number }) => {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) return

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap())
        }

        api.on("select", onSelect)
        onSelect() // Initial check

        return () => {
            api.off("select", onSelect)
        }
    }, [api])

    if (count <= 1) return null

    return (
        <div className="flex justify-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        current === index ? "bg-primary w-4" : "bg-muted-foreground/30"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    )
}

// Default slides for initial drop
const defaultSlides: Slide[] = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        title: 'Mountain View',
        description: 'Breathtaking mountain scenery.'
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        title: 'Sunny Beach',
        description: 'Relaxing sounds of the ocean.'
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
        title: 'Starry Night',
        description: 'A beautiful night sky full of stars.'
    }
]

export const Carousel = defineBlock<CarouselProps>({
    name: "Carousel",
    category: "Media",
    icon: <div className="p-1 border rounded bg-muted/20">C</div>, // Placeholder icon

    defaultProps: {
        slides: defaultSlides,
        loop: true,
        showArrows: true,
        showDots: true,
        slidesPerView: '1',
        width: '100%',
        height: '400px',
        paddingTop: 0,
        paddingBottom: 0,
        style: {}
    },

    settingsConfig: {
        width: { label: 'Width', type: 'text' },
        height: { label: 'Height', type: 'text' },
        slidesPerView: {
            label: 'Slides Per View',
            type: 'select',
            options: [
                { label: '1', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '4', value: '4' }
            ]
        },
        loop: { label: 'Infinite Loop', type: 'checkbox' },
        showArrows: { label: 'Show Arrows', type: 'checkbox' },
        showDots: { label: 'Show Dots', type: 'checkbox' },
        slides: {
            label: 'Slides',
            type: 'array',
            arrayFields: {
                image: { label: 'Image URL', type: 'media' },
                title: { label: 'Title', type: 'text' },
                description: { label: 'Description', type: 'textarea' }
            }
        }
    },

    render: ({
        slides = [],
        loop,
        showArrows,
        showDots,
        slidesPerView,
        width,
        height,
        paddingTop,
        paddingBottom,
        style,
        className
    }) => {
        const [api, setApi] = useState<CarouselApi>()

        // Merge root dimension props into style for useBlockStyles
        const mergedStyle: BlockStyle = {
            ...style,
            width,
            height,
            paddingTop,
            paddingBottom
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: mergedStyle,
            className: cn("w-full relative group", className)
        })

        // Re-initialize carousel when dimensions or layout props change
        useEffect(() => {
            if (api) {
                api.reInit()
            }
        }, [api, width, height, slidesPerView])

        // Calculate basis class based on slidesPerView
        const getBasisClass = () => {
            switch (slidesPerView) {
                case '2': return "basis-1/2"
                case '3': return "basis-1/3"
                case '4': return "basis-1/4"
                default: return "basis-full"
            }
        }

        return (
            <div
                className={computedClassName}
                style={computedStyle}
            >
                <UICarousel
                    setApi={setApi}
                    opts={{
                        loop: loop,
                        align: "start",
                    }}
                    className="w-full h-full"
                >
                    <CarouselContent className="-ml-1 h-full">
                        {slides.length > 0 ? (
                            slides.map((slide, index) => (
                                <CarouselItem key={slide.id || index} className={cn(getBasisClass(), "pl-1 h-full")}>
                                    <div className="p-1 h-full">
                                        <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-full">
                                            <div className="relative w-full h-full overflow-hidden">
                                                {slide.image ? (
                                                    <img
                                                        src={slide.image}
                                                        alt={slide.title || "Slide"}
                                                        className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <span className="text-muted-foreground">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            {(slide.title || slide.description) && (
                                                <div className="p-4 space-y-2">
                                                    {slide.title && <h3 className="font-semibold leading-none tracking-tight">{slide.title}</h3>}
                                                    {slide.description && <p className="text-sm text-muted-foreground">{slide.description}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem className="basis-full h-full">
                                <div className="flex h-full items-center justify-center rounded-xl border bg-muted p-6">
                                    <span className="text-muted-foreground">Add slides to start</span>
                                </div>
                            </CarouselItem>
                        )}
                    </CarouselContent>

                    {showArrows && (
                        <>
                            <CarouselPrevious className="left-2 bg-white/80 hover:bg-white drop-shadow-md border-0" />
                            <CarouselNext className="right-2 bg-white/80 hover:bg-white drop-shadow-md border-0" />
                        </>
                    )}

                    {showDots && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                            <CarouselDots api={api} count={slides.length} />
                        </div>
                    )}
                </UICarousel>
            </div>
        )
    }
})
