import { Metadata } from "next"
import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export const metadata: Metadata = {
    title: "Blog Builder — PROTOTYPE",
    description: "Craft your identity with PROTOTYPE's intuitive blog builder. A canvas designed for pure expression and total creative control.",
}

export default function BlogBuilderPage() {
    return (
        <MarketingPageWrapper
            title="BLOG BUILDER"
            subtitle="Craft Your Identity"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
                <div className="space-y-8">
                    <p className="font-mono text-lg text-foreground/70 leading-relaxed">
                        Stop fighting with cumbersome interfaces. PROTOTYPE's Blog Builder is designed for pure expression.
                        A canvas that respects your vision and stays out of your way.
                    </p>

                    <div className="space-y-12 mt-16">
                        <section>
                            <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight text-white mb-4 italic">TOTAL CREATIVE CONTROL</h3>
                            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                                Every element is yours to command. From typographic scales to complex grid layouts,
                                nothing is restricted. Build the blog you've always wanted, not the one a template dictates.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight text-white mb-4 italic">OPTIMIZED FOR SPEED</h3>
                            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                                We generate clean, lightweight code that scores perfectly on performance metrics.
                                Your readers shouldn't wait for your words.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="relative aspect-square border border-white/10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="w-full h-full border border-dashed border-white/20 flex flex-col items-center justify-center space-y-4">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Preview Interface</span>
                            <div className="w-3/4 h-1 bg-white/10" />
                            <div className="w-1/2 h-1 bg-white/10" />
                            <div className="w-2/3 h-1 bg-orange-500/50" />
                        </div>
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
