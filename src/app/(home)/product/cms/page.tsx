"use client"

import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"
import { motion } from "framer-motion"

export default function CMSPage() {
    return (
        <MarketingPageWrapper
            title="CMS PLATFORM"
            subtitle="Universal Content Layer"
        >
            <div className="max-w-4xl space-y-16">
                <p className="font-mono text-xl text-foreground/80 leading-tight">
                    Manage contents without the overhead. Our CMS is a headless powerhouse built for
                    developers and creators alike.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 border border-white/5 bg-white/[0.02]">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-6">Scalable</h4>
                        <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                            From personal journals to industrial-scale publishing networks.
                        </p>
                    </div>
                    <div className="p-8 border border-white/5 bg-white/[0.02]">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-6">API-First</h4>
                        <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                            Access your content anywhere with our lightning-fast GraphQL and REST APIs.
                        </p>
                    </div>
                    <div className="p-8 border border-white/5 bg-white/[0.02]">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-6">Real-time</h4>
                        <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                            Collaborative editing and instant deployments. No rebuild waits.
                        </p>
                    </div>
                </div>

                <section className="pt-16">
                    <h2 className="font-[var(--font-bebas)] text-5xl tracking-tight mb-8 italic">STAY IN SYNC</h2>
                    <div className="space-y-6 max-w-2xl">
                        <p className="font-mono text-sm text-muted-foreground leading-relaxed border-l border-orange-500/50 pl-6">
                            Distribute your content to web, mobile, and social platforms from a single source of truth.
                            Customize your workflow with webhooks and direct integrations.
                        </p>
                    </div>
                </section>
            </div>
        </MarketingPageWrapper>
    )
}
