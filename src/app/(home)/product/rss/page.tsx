import { Metadata } from "next"
import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export const metadata: Metadata = {
    title: "RSS Scraper — PROTOTYPE",
    description: "Automate your content ingestion with the world's most advanced RSS engine. Discover, scrape, and transform content seamlessly.",
}

export default function RSSPage() {
    return (
        <MarketingPageWrapper
            title="RSS SCRAPER"
            subtitle="Automated Intelligence"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-12">
                    <h2 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight italic">FEED YOUR ECOSYSTEM</h2>
                    <p className="font-mono text-lg text-foreground/70 leading-relaxed max-w-2xl">
                        The world's most advanced RSS ingestion engine. Automatically discover, scrape,
                        and transform content from across the web into your own branded ecosystem.
                    </p>

                    <div className="space-y-4">
                        {[
                            "Intelligent Content Extraction",
                            "Multi-source Aggregation",
                            "Automated Category Matching",
                            "Custom Transformation Rules",
                            "Duplicate Detection"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 text-orange-500">
                                <div className="w-1.5 h-1.5 bg-orange-500" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-white/90">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 border-l border-white/10 pl-12 py-12 space-y-8">
                    <div className="font-mono text-sm text-muted-foreground leading-relaxed italic">
                        "We've combined the raw utility of RSS with modern AI-driven analysis to make content
                        aggregation feel like content creation."
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        System Logic v2.44
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
