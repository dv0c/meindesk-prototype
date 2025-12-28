"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"

const experiments = [
  {
    title: "Drag & Drop Editor",
    medium: "Core Feature",
    description: "Visual block-based editor. Build pages without writing code. 50+ components included.",
    span: "col-span-2 row-span-2",
  },
  {
    title: "RSS Scraper",
    medium: "Content Import",
    description: "Auto-import content from any RSS feed. Set schedules and filters.",
    span: "col-span-1 row-span-1",
  },
  {
    title: "SEO Builder",
    medium: "Optimization",
    description: "AI meta tags, sitemaps, schema markup. Rank higher, grow faster.",
    span: "col-span-1 row-span-2",
  },
  {
    title: "Analytics",
    medium: "Insights",
    description: "Real-time visitor tracking, engagement metrics, and performance reports. Know your audience.",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Theme Store",
    medium: "Customization",
    description: "Install themes instantly. Request custom designs from our team.",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Free Forever Tier",
    medium: "Pricing",
    description: "Start building today. No credit card required. Upgrade when you're ready.",
    span: "col-span-2 row-span-1",
  },
  {
    title: "Full Control",
    medium: "Flexibility",
    description: "Modify everything. Export your data. Your content, your rules.",
    span: "col-span-1 row-span-1",
  },
]

export function WorkSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const headerInView = useInView(headerRef, { once: false, amount: 0.3 })
  const gridInView = useInView(gridRef, { once: false, amount: 0.2 })

  return (
    <section id="features" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <motion.div
        ref={headerRef}
        initial={{ x: -60, opacity: 0 }}
        animate={headerInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 flex items-end justify-between"
      >
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Features</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">POWERFUL TOOLS</h2>
        </div>
        <p className="hidden md:block max-w-xs font-mono text-xs text-muted-foreground text-right leading-relaxed">
          Everything you need to build, manage, and grow your blog or website.
        </p>
      </motion.div>

      {/* Asymmetric grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[200px]"
      >
        {experiments.map((experiment, index) => (
          <motion.div
            key={index}
            initial={{ y: 60, opacity: 0 }}
            animate={gridInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: index * 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <WorkCard experiment={experiment} index={index} persistHover={index === 0} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function WorkCard({
  experiment,
  index,
  persistHover = false,
}: {
  experiment: {
    title: string
    medium: string
    description: string
    span: string
  }
  index: number
  persistHover?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const isInView = useInView(cardRef, { once: true, amount: 0.5 })
  const isScrollActive = persistHover && isInView

  const isActive = isHovered || isScrollActive

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative border border-border/40 p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
        experiment.span,
        isActive && "border-accent/60",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "absolute inset-0 bg-accent/5 transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {experiment.medium}
        </span>
        <h3
          className={cn(
            "mt-3 font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight transition-colors duration-300",
            isActive ? "text-accent" : "text-foreground",
          )}
        >
          {experiment.title}
        </h3>
      </div>

      <div className="relative z-10">
        <p
          className={cn(
            "font-mono text-xs text-muted-foreground leading-relaxed transition-all duration-500 max-w-[280px]",
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          {experiment.description}
        </p>
      </div>

      <span
        className={cn(
          "absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300",
          isActive ? "text-accent" : "text-muted-foreground/40",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div
        className={cn(
          "absolute top-0 right-0 w-12 h-12 transition-all duration-500",
          isActive ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-0 right-0 w-full h-[1px] bg-accent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-accent" />
      </div>
    </article>
  )
}
