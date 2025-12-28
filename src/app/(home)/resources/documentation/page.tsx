"use client"

import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export default function DocumentationPage() {
    return (
        <MarketingPageWrapper
            title="DOCUMENTATION"
            subtitle="Knowledge Base"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                <div className="space-y-12">
                    <p className="font-mono text-lg text-foreground/70 leading-relaxed italic border-l-2 border-orange-500 pl-8">
                        Master the PROTOTYPE platform with our comprehensive guides and developer resources.
                        Everything you need to build, scale, and optimize.
                    </p>

                    <div className="space-y-8">
                        <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight uppercase">Quick Start</h3>
                        <div className="space-y-4">
                            {["Installation", "Project Setup", "Creating your first Blog", "Theme Customization"].map((step, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-white/5 py-3">
                                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{step}</span>
                                    <span className="font-mono text-[9px] text-orange-500">READ</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-12 border border-white/10 bg-white/[0.02] space-y-8">
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-orange-500">Developer SDK</h3>
                    <pre className="font-mono text-[10px] text-muted-foreground leading-normal overflow-x-auto">
                        <code>{`// Initialize Prototype
const prototype = new Prototype({
  apiKey: process.env.PROTOTYPE_KEY,
  siteId: "site_alpha_92"
});

// Fetch all articles
const articles = await prototype.articles.list();`}</code>
                    </pre>
                    <div className="pt-4">
                        <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">
                            Our SDK is built for modern environments, providing full type safety and edge-ready performance.
                        </p>
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
