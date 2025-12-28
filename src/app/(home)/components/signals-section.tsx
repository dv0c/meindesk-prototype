"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, useInView, PanInfo, useAnimation } from "framer-motion"

const signals = [
  {
    date: "2025.06.15",
    title: "Analytics Pro",
    note: "Advanced analytics with heatmaps, conversion funnels, and audience insights. Track everything.",
  },
  {
    date: "2025.06.10",
    title: "RSS Scraper 2.0",
    note: "Auto-import content from any RSS feed. Schedule posts, filter by keywords.",
  },
  {
    date: "2025.05.28",
    title: "Theme Marketplace",
    note: "Browse, install, and customize themes. Request custom designs.",
  },
  {
    date: "2025.05.15",
    title: "SEO Builder Pro",
    note: "AI-powered meta tags, sitemap generation, and schema markup.",
  },
  {
    date: "2025.04.30",
    title: "Drag-Drop Editor",
    note: "New block system with 50+ components. No code required.",
  },
]

export function SignalsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(signals.length)
  const [cardsPerView, setCardsPerView] = useState(3)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const controls = useAnimation()

  // Triplicate signals for infinite loop
  const displaySignals = [...signals, ...signals, ...signals]

  const headerInView = useInView(headerRef, { once: false, amount: 0.3 })

  // Detect screen size for responsive cards per view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      if (mobile) {
        setCardsPerView(1)
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2)
      } else {
        setCardsPerView(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxIndex = Math.max(0, signals.length - cardsPerView)

  // Auto-play carousel on desktop only
  useEffect(() => {
    if (isMobile || isDragging) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [cardsPerView, isDragging, isMobile])

  // Handle infinite loop reset when animation completes
  const handleAnimationComplete = () => {
    const N = signals.length
    if (currentIndex >= 2 * N) {
      // Reset to middle set start
      const newIndex = currentIndex - N
      setCurrentIndex(newIndex)
      if (containerRef.current) {
        const itemWidth = containerRef.current.offsetWidth / cardsPerView
        controls.set({ x: -newIndex * itemWidth })
      }
    } else if (currentIndex < N) {
      // Reset to middle set end
      const newIndex = currentIndex + N
      setCurrentIndex(newIndex)
      if (containerRef.current) {
        const itemWidth = containerRef.current.offsetWidth / cardsPerView
        controls.set({ x: -newIndex * itemWidth })
      }
    }
  }

  // Animate to current index (desktop only)
  useEffect(() => {
    if (isMobile || !containerRef.current) return

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
  }, [currentIndex, controls, isMobile, cardsPerView])

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
    setCurrentIndex((prev) => prev + 1)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => prev - 1)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(signals.length + index)
  }

  return (
    <section id="updates" ref={sectionRef} className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <motion.div
        ref={headerRef}
        initial={{ x: -60, opacity: 0 }}
        animate={headerInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Updates</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">LATEST RELEASES</h2>
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
            {signals.map((signal, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[85vw] snap-center"
              >
                <SignalCard signal={signal} index={index} isDragging={false} />
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
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              onAnimationComplete={handleAnimationComplete}
              animate={controls}
              className="flex"
            >
              {displaySignals.map((signal, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <SignalCard signal={signal} index={index} isDragging={isDragging} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Controls (Desktop Only) */}
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
                  "w-5 h-5 transition-colors duration-300",
                  currentIndex === 0
                    ? "text-muted-foreground/30"
                    : "text-muted-foreground group-hover:text-accent",
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
            <div className="flex gap-2 ml-4">
              {signals.map((_, index) => {
                const effectiveIndex = (currentIndex - signals.length + signals.length * 3) % signals.length
                return (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === effectiveIndex
                        ? "bg-accent w-8"
                        : "bg-border/40 hover:bg-border",
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                )
              })}
            </div>

            {/* Counter */}
            <div className="ml-auto font-mono text-xs text-muted-foreground">
              <span className="text-accent">{String(((currentIndex - signals.length + signals.length * 3) % signals.length) + 1).padStart(2, "0")}</span>
              {" / "}
              <span>{String(signals.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function SignalCard({
  signal,
  index,
  isDragging,
}: {
  signal: { date: string; title: string; note: string }
  index: number
  isDragging: boolean
}) {
  return (
    <article
      className={cn(
        "group relative h-full",
        "transition-transform duration-500 ease-out",
        !isDragging && "hover:-translate-y-2",
      )}
    >
      <div className="relative bg-card border border-border/50 md:border-t md:border-l md:border-r-0 md:border-b-0 p-8 h-full flex flex-col">
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        <div className="flex items-baseline justify-between mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            v. {String(index + 1).padStart(2, "0")}
          </span>
          <time className="font-mono text-[10px] text-muted-foreground/60">{signal.date}</time>
        </div>

        <h3 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4 group-hover:text-accent transition-colors duration-300">
          {signal.title}
        </h3>

        <div className="w-12 h-px bg-accent/60 mb-6 group-hover:w-full transition-all duration-500" />

        <p className="font-mono text-xs text-muted-foreground leading-relaxed">{signal.note}</p>

        <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l border-border/30" />
        </div>
      </div>

      <div className="absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </article>
  )
}
