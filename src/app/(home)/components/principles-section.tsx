"use client"

import { useRef } from "react"
import { HighlightText } from "../components/highlight-text"
import { motion, useInView } from "framer-motion"

const principles = [
  {
    number: "01",
    titleParts: [
      { text: "ZERO", highlight: true },
      { text: " CODE REQUIRED", highlight: false },
    ],
    description: "Build complete websites without touching code. Our visual editor handles everything.",
    align: "left" as const,
  },
  {
    number: "02",
    titleParts: [
      { text: "TOTAL", highlight: true },
      { text: " CUSTOMIZATION", highlight: false },
    ],
    description: "Modify themes, layouts, and styles. Your site, your way. No restrictions.",
    align: "right" as const,
  },
  {
    number: "03",
    titleParts: [
      { text: "CONTENT ", highlight: false },
      { text: "FREEDOM", highlight: true },
    ],
    description: "Import RSS feeds, export your data, own your content. You're never locked in.",
    align: "left" as const,
  },
  {
    number: "04",
    titleParts: [
      { text: "SCALE ", highlight: false },
      { text: "AFFORDABLY", highlight: true },
    ],
    description: "Generous free tier to start. Upgrade only when your audience grows. Fair pricing always.",
    align: "right" as const,
  },
]

function PrincipleItem({ principle }: { principle: typeof principles[0] }) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })
  const isRight = principle.align === "right"

  return (
    <motion.article
      ref={ref}
      initial={{ x: isRight ? 80 : -80, opacity: 0 }}
      animate={isInView ? { x: 0, opacity: 1 } : { x: isRight ? 80 : -80, opacity: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isRight ? "items-end text-right" : "items-start text-left"}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
        {principle.number} / {principle.titleParts[0].text.split(" ")[0]}
      </span>

      <h3 className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none">
        {principle.titleParts.map((part, i) =>
          part.highlight ? (
            <HighlightText key={i} parallaxSpeed={0.6}>
              {part.text}
            </HighlightText>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </h3>

      <p className="mt-6 max-w-md font-mono text-sm text-muted-foreground leading-relaxed">
        {principle.description}
      </p>

      <div className={`mt-8 h-[1px] bg-border w-24 md:w-48 ${isRight ? "mr-0" : "ml-0"}`} />
    </motion.article>
  )
}

export function PrinciplesSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: false, amount: 0.3 })

  return (
    <section id="philosophy" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <motion.div
        ref={headerRef}
        initial={{ x: -60, opacity: 0 }}
        animate={headerInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-24"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Philosophy</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">WHY PROTOTYPE</h2>
      </motion.div>

      {/* Staggered principles */}
      <div className="space-y-24 md:space-y-32">
        {principles.map((principle, index) => (
          <PrincipleItem key={index} principle={principle} />
        ))}
      </div>
    </section>
  )
}
