"use client"

import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export default function ThemesPage() {
    return (
        <MarketingPageWrapper
            title="THEME STORE"
            subtitle="Visual Identity"
        >
            <div className="space-y-24">
                <section className="max-w-3xl">
                    <h2 className="font-[var(--font-bebas)] text-5xl md:text-8xl tracking-tight mb-8 leading-[0.9]">ELITE <br />ARCHITECTURES</h2>
                    <p className="font-mono text-lg text-foreground/70 leading-relaxed">
                        Choose from a curated collection of high-performance themes. Each one is a masterpiece of design,
                        engineered for conversion and aesthetic excellence.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { name: "NOIR", desc: "High contrast, minimal editorial" },
                        { name: "GRID", desc: "Scientific precision, modular layout" },
                        { name: "FLOW", desc: "Organic transitions, focus on motion" },
                    ].map((theme, i) => (
                        <div key={i} className="group relative aspect-[3/4] border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-end overflow-hidden cursor-crosshair">
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                            <h4 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-2 italic group-hover:text-orange-500 transition-colors">{theme.name}</h4>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{theme.desc}</p>
                        </div>
                    ))}
                </div>

                <section className="pt-24 border-t border-white/10 flex flex-col md:flex-row gap-12">
                    <div className="md:w-1/3">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-orange-500 mb-6">Customization</h3>
                        <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">
                            Every theme supports full variable injection. Change fonts, colors, and layout spacing globally
                            with single-click updates.
                        </p>
                    </div>
                    <div className="md:w-1/3">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-orange-500 mb-6">Performance</h3>
                        <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">
                            Average Lighthouse score across our entire collection: 99/100. Design without compromise.
                        </p>
                    </div>
                </section>
            </div>
        </MarketingPageWrapper>
    )
}
