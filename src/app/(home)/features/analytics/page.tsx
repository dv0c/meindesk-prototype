import { Metadata } from "next"
import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export const metadata: Metadata = {
    title: "Analytics — PROTOTYPE",
    description: "Privacy-first analytics for creators. Understand your audience flow without cookies.",
}

export default function AnalyticsPage() {
    return (
        <MarketingPageWrapper
            title="ANALYTICS"
            subtitle="Data Insight"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                    <h2 className="font-[var(--font-bebas)] text-4xl md:text-7xl tracking-tight mb-8 leading-none">UNDERSTAND YOUR <br /><span className="text-orange-500">AUDIENCE FLOW</span></h2>
                    <p className="font-mono text-lg text-foreground/70 leading-relaxed max-w-2xl mb-16">
                        Privacy-first analytics that respect your users while giving you the insights you need to grow.
                        No cookies, just pure performance data.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 overflow-hidden">
                        <div className="border-l border-white/10 pl-8">
                            <span className="font-mono text-[10px] text-orange-500 uppercase tracking-widest mb-4 block">Engagement</span>
                            <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">
                                Track drop-off points, session duration, and click-through rates with surgical precision.
                            </p>
                        </div>
                        <div className="border-l border-white/10 pl-8">
                            <span className="font-mono text-[10px] text-orange-500 uppercase tracking-widest mb-4 block">Geographics</span>
                            <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">
                                Visualize your global reach with real-time heatmaps and regional distribution.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 self-center">
                    {/* Note: Removed Math.random() usage in JSX to prevent hydration mismatch since this is now a server component. 
                In a real app, this should be data-driven or handled in a client component. */}
                    <div className="space-y-1 font-mono text-[10px] uppercase tracking-tighter text-muted-foreground/30">
                        <div className="flex gap-2"><span>0x4A2B</span><div className="h-[2px] bg-white/5 flex-1 w-[40%]" /></div>
                        <div className="flex gap-2"><span>0xF1C3</span><div className="h-[2px] bg-white/5 flex-1 w-[70%]" /></div>
                        <div className="flex gap-2"><span>0xDEAD</span><div className="h-[2px] bg-white/5 flex-1 w-[20%]" /></div>
                        <div className="flex gap-2"><span>0xBEEF</span><div className="h-[2px] bg-white/5 flex-1 w-[90%]" /></div>
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
