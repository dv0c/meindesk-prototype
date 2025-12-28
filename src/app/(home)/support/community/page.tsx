import { Metadata } from "next"
import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export const metadata: Metadata = {
    title: "Community — PROTOTYPE",
    description: "Join thousands of PROTOTYPE crafters. Share templates, workflows, and insights.",
}

export default function CommunityPage() {
    return (
        <MarketingPageWrapper
            title="COMMUNITY"
            subtitle="Ecosystem Dynamics"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-12">
                    <h2 className="font-[var(--font-bebas)] text-5xl md:text-8xl tracking-tight mb-8 uppercase leading-[0.85]">Join thousands of <br /><span className="text-orange-500">PROTOTYPE CRAFTERS</span></h2>
                </div>

                <div className="lg:col-span-8 space-y-16">
                    <p className="font-mono text-xl text-foreground/70 leading-tight max-w-3xl">
                        A thriving ecosystem of publishers, developers, and designers sharing
                        templates, workflows, and insights.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-8 border border-white/5 bg-white/[0.02]">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-6">Discord Guild</h4>
                            <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed mb-8">
                                Real-time collaboration and direct access to the core engineering team.
                            </p>
                            <span className="font-mono text-[9px] text-white border-b border-orange-500 pb-1">JOIN CHANNEL</span>
                        </div>
                        <div className="p-8 border border-white/5 bg-white/[0.02]">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-6">Marketplace</h4>
                            <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed mb-8">
                                Sell your custom themes and snippets to the global Prototype userbase.
                            </p>
                            <span className="font-mono text-[9px] text-white border-b border-orange-500 pb-1">VISIT STORE</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-4">
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col border-l border-white/10 pl-4 py-1">
                                <span className="font-mono text-[10px] text-white">alex_v</span>
                                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">published theme 'GHOST'</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-4 py-1">
                                <span className="font-mono text-[10px] text-white">marina.s</span>
                                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">solved query #422</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-4 py-1">
                                <span className="font-mono text-[10px] text-white">dev_hq</span>
                                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">updated core build v2.5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
