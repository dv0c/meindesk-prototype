import { Metadata } from "next"
import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export const metadata: Metadata = {
    title: "SEO Tools — PROTOTYPE",
    description: "Automated search engine optimization. We handle the rankings so you can focus on writing.",
}

export default function SEOPage() {
    return (
        <MarketingPageWrapper
            title="SEO TOOLS"
            subtitle="Visibility Engineered"
        >
            <div className="max-w-4xl space-y-24">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <p className="font-mono text-xl text-foreground/80 leading-tight">
                        We've automated the complex parts of search engine optimization,
                        so you can focus on writing while we handle the ranking.
                    </p>
                    <div className="space-y-6">
                        <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight text-orange-500 italic uppercase">BUILT-IN AUTOMATION</h3>
                        <ul className="space-y-4 font-mono text-sm text-muted-foreground">
                            <li>• Automated JSON-LD Schema Generation</li>
                            <li>• Dynamic XML Sitemaps & robots.txt</li>
                            <li>• Automated Meta-Tag Management</li>
                            <li>• Image Alt-Text Optimization</li>
                        </ul>
                    </div>
                </section>

                <div className="p-12 border border-white/10 bg-neutral-900/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <h3 className="font-[var(--font-bebas)] text-5xl tracking-tight mb-8">REAL-TIME SEO ANALYZER</h3>
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-xl mb-12 uppercase tracking-wide">
                        Our editor includes a real-time SEO intelligence layer that scores your content as you type,
                        providing actionable suggestions to improve your search visibility instantly.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-12 h-1 bg-green-500" />
                        <div className="w-12 h-1 bg-green-500" />
                        <div className="w-12 h-1 bg-green-500" />
                        <div className="w-12 h-1 bg-white/10" />
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
