"use client"

import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export default function APIReferencePage() {
    return (
        <MarketingPageWrapper
            title="API REFERENCE"
            subtitle="Core Infrastructure"
        >
            <div className="max-w-4xl space-y-16">
                <p className="font-mono text-xl text-foreground/80 leading-tight">
                    Communicate with our platform programmatically. Our API is designed to be
                    predictable, RESTful, and highly performant.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500">Authentication</h4>
                        <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">
                            Use Bearer tokens to authenticate your requests. All API requests must be made over HTTPS.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500">Rate Limits</h4>
                        <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">
                            Standard rate limits apply based on your plan. High-volume ingestion is supported on Enterprise tier.
                        </p>
                    </div>
                </div>

                <section className="border-t border-white/10 pt-16">
                    <h2 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-8 italic uppercase">Endpoints</h2>
                    <div className="space-y-2">
                        {[
                            { method: "GET", path: "/v1/sites", desc: "List all sites" },
                            { method: "POST", path: "/v1/articles", desc: "Create a new article" },
                            { method: "PUT", path: "/v1/themes/:id", desc: "Update theme variables" },
                            { method: "DELETE", path: "/v1/media/:id", desc: "Remove asset" },
                        ].map((endpoint, i) => (
                            <div key={i} className="flex gap-6 items-center p-4 bg-white/[0.02] border border-white/5 font-mono text-xs">
                                <span className="text-orange-500 font-bold w-12">{endpoint.method}</span>
                                <span className="text-white/80 flex-1">{endpoint.path}</span>
                                <span className="text-muted-foreground/50 uppercase text-[9px] tracking-widest">{endpoint.desc}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </MarketingPageWrapper>
    )
}
