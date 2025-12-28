"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { PrototypeBadge } from "@/components/PrototypeBadge"
import Link from "next/link"

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
            <li><Link href="/product/blog-builder" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Blog Builder</Link></li>
            <li><Link href="/product/cms" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">CMS Platform</Link></li>
            <li><Link href="/product/rss" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">RSS Scraper</Link></li>
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
            <li><Link href="/features/editor" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Drag & Drop</Link></li>
            <li><Link href="/features/seo" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">SEO Tools</Link></li>
            <li><Link href="/features/analytics" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Analytics</Link></li>
            <li><Link href="/features/themes" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Theme Store</Link></li>
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
            <li><Link href="/pricing" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Free Tier</Link></li>
            <li><Link href="/pricing#pro" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Pro Plan</Link></li>
            <li><Link href="/pricing#enterprise" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Enterprise</Link></li>
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
            <li><Link href="/resources/documentation" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Documentation</Link></li>
            <li><Link href="/resources/api-reference" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">API Reference</Link></li>
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
              <Link
                href="mailto:hello@prototype.app"
                className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors duration-200"
              >
                Email
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors duration-200"
              >
                Twitter/X
              </Link>
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
            <li><Link href="/support/help-center" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Help Center</Link></li>
            <li><Link href="/support/community" className="font-mono text-xs text-foreground/80 hover:text-orange-500 transition-colors">Community</Link></li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom copyright */}
      <motion.div
        ref={footerRef}
        initial={{ y: 20, opacity: 0 }}
        animate={footerInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2025 Prototype. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">Build your vision. Own your content.</p>
        <PrototypeBadge sticky={false} />
      </motion.div>
    </section>
  )
}
