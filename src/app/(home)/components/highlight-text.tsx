"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"

interface HighlightTextProps {
  children: ReactNode
  className?: string
  parallaxSpeed?: number
}

export function HighlightText({ children, className = "", parallaxSpeed = 0.3 }: HighlightTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  const isInView = useInView(containerRef, { once: false, amount: 0.5 })

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -20 * parallaxSpeed])

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}>
      <motion.span
        ref={highlightRef}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          y: yParallax,
          transformOrigin: "left center",
        }}
        className="absolute inset-0 bg-accent"
        data-highlight-bg
      >
        <span
          className="absolute inset-0"
          style={{
            left: "-0.1em",
            right: "-0.1em",
            top: "0.15em",
            bottom: "0.1em",
          }}
        />
      </motion.span>
      <motion.span
        ref={textRef}
        initial={{ color: "rgb(250, 250, 250)" }}
        animate={isInView ? { color: "#000000" } : { color: "rgb(250, 250, 250)" }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        {children}
      </motion.span>
    </span>
  )
}
