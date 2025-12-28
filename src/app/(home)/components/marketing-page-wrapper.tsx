"use client"

import type React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarketingPageWrapperProps {
    title: string
    subtitle: string
    children: React.ReactNode
}

export function MarketingPageWrapper({ title, subtitle, children }: MarketingPageWrapperProps) {
    return (
        <div className="relative min-h-screen bg-black text-white selection:bg-orange-500/30">
            {/* Background grid */}
            <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-6 md:px-28 py-8">
                <Link
                    href="/"
                    className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
                <div className="font-[var(--font-bebas)] text-2xl tracking-tight text-white">
                    <span className="text-orange-500">P</span>ROTOTYPE
                </div>
            </nav>

            <main className="relative z-10 px-6 md:px-28 py-16 md:py-24">
                {/* Header */}
                <header className="max-w-4xl mb-24">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-mono text-[10px] uppercase tracking-[0.4em] text-orange-500 mb-6 block"
                    >
                        {subtitle}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="font-[var(--font-bebas)] text-6xl md:text-9xl tracking-tight leading-[0.9] mb-8"
                    >
                        {title}
                    </motion.h1>
                </header>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative"
                >
                    {children}
                </motion.div>

                {/* CTA Section */}
                <footer className="mt-32 pt-24 border-t border-white/10 text-center pb-24">
                    <h2 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight mb-8">
                        READY TO OWN YOUR CONTENT?
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="bg-orange-600 hover:bg-orange-700 text-white rounded-none px-12 h-14 font-mono uppercase tracking-widest group"
                            >
                                Start Building
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </footer>
            </main>
        </div>
    )
}
