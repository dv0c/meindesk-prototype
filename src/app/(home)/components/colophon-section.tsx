"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export function ColophonSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const headerInView = useInView(headerRef, { once: false, amount: 0.3 })
  const gridInView = useInView(gridRef, { once: false, amount: 0.3 })
  const footerInView = useInView(footerRef, { once: false, amount: 0.3 })

  return (
    <section
      id="colophon"
      className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 border-t border-border/30"
    >
      {/* Section header */}
      <motion.div
        ref={headerRef}
        initial={{ x: -60, opacity: 0 }}
        animate={headerInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / Info</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">GET STARTED</h2>
      </motion.div>

      {/* Multi-column layout */}
      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
        {/* Product */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={gridInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-1"
        >
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Product</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Blog Builder</li>
            <li className="font-mono text-xs text-foreground/80">CMS Platform</li>
            <li className="font-mono text-xs text-foreground/80">RSS Scraper</li>
          </ul>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={gridInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-1"
        >
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Features</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Drag & Drop</li>
            <li className="font-mono text-xs text-foreground/80">SEO Tools</li>
            <li className="font-mono text-xs text-foreground/80">Analytics</li>
            <li className="font-mono text-xs text-foreground/80">Theme Store</li>
          </ul>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={gridInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-1"
        >
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Pricing</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Free Tier</li>
            <li className="font-mono text-xs text-foreground/80">Pro Plan</li>
            <li className="font-mono text-xs text-foreground/80">Enterprise</li>
          </ul>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={gridInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-1"
        >
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Resources</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Documentation</li>
            <li className="font-mono text-xs text-foreground/80">API Reference</li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={gridInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-1"
        >
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:hello@prototype.app"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                Twitter/X
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={gridInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-1"
        >
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Support</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Help Center</li>
            <li className="font-mono text-xs text-foreground/80">Community</li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom copyright */}
      <motion.div
        ref={footerRef}
        initial={{ y: 20, opacity: 0 }}
        animate={footerInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2025 Prototype. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">Build your vision. Own your content.</p>
      </motion.div>
    </section>
  )
}
