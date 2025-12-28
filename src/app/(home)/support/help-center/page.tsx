import { Metadata } from "next"
import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"
import { Search } from "lucide-react"

export const metadata: Metadata = {
    title: "Help Center — PROTOTYPE",
    description: "Find answers and solve technical hurdles with our resolution center.",
}

export default function HelpCenterPage() {
    return (
        <MarketingPageWrapper
            title="HELP CENTER"
            subtitle="Resolution Center"
        >
            <div className="space-y-24">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="SEARCH FOR ANSWERS..."
                        className="w-full bg-white/[0.02] border border-white/10 h-16 pl-14 pr-6 font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { cat: "Billing", count: 12 },
                        { cat: "Account", count: 8 },
                        { cat: "Builder", count: 24 },
                        { cat: "Domain", count: 6 },
                        { cat: "RSS", count: 15 },
                        { cat: "Privacy", count: 4 },
                    ].map((item, i) => (
                        <div key={i} className="p-8 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-pointer">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-2 group-hover:text-white transition-colors">{item.cat}</h4>
                            <p className="font-mono text-[9px] text-muted-foreground uppercase">{item.count} Articles</p>
                        </div>
                    ))}
                </div>

                <section className="bg-orange-600/5 p-12 border border-orange-500/20 max-w-2xl italic">
                    <p className="font-mono text-sm text-foreground/80 leading-relaxed mb-6">
                        "Still can't find what you're looking for? Our support engineers are always on standby
                        to help you solve complex technical hurdles."
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white">Contact Support Eng</span>
                </section>
            </div>
        </MarketingPageWrapper>
    )
}
