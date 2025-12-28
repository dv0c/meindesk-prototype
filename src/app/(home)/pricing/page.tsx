import { Metadata } from "next"
import { MarketingPageWrapper } from "../components/marketing-page-wrapper"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Pricing — PROTOTYPE",
    description: "Investment in quality. Transparent pricing for creators, professionals, and enterprises.",
}

export default function PricingPage() {
    const plans = [
        {
            name: "FREE TIER",
            price: "$0",
            description: "Perfect for personal projects",
            features: [
                "1 Blog / Site",
                "5,000 Views / Month",
                "Basic RSS Scraper",
                "Community Themes",
                "Prototype Badge"
            ],
            notIncluded: ["Custom Domain", "Advanced Analytics", "SEO Tools"],
            cta: "Continue Free",
            highlighted: false
        },
        {
            name: "PRO PLAN",
            price: "$19",
            description: "For professional creators",
            features: [
                "5 Blogs / Sites",
                "100,000 Views / Month",
                "Advanced RSS Scraping",
                "All Premium Themes",
                "Remove Watermark",
                "Custom Domains",
                "SEO Suite"
            ],
            notIncluded: ["Dedicated Support"],
            cta: "Get Started",
            highlighted: true
        },
        {
            name: "ENTERPRISE",
            price: "Custom",
            description: "For high-volume publishing",
            features: [
                "Unlimited Blogs",
                "Unlimited Views",
                "Custom RSS Logic",
                "API Access",
                "White-label Solution",
                "SSO / Team Support",
                "Priority 24/7 Support"
            ],
            notIncluded: [],
            cta: "Talk to Sales",
            highlighted: false
        }
    ]

    return (
        <MarketingPageWrapper
            title="PRICING"
            subtitle="Investment in Quality"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`relative p-8 border ${plan.highlighted ? 'border-orange-500' : 'border-white/10'} bg-white/[0.02] flex flex-col`}
                    >
                        {plan.highlighted && (
                            <div className="absolute top-0 right-0 bg-orange-600 text-[8px] font-mono font-bold px-3 py-1 uppercase tracking-widest text-white translate-y-[-100%]">
                                Most Popular
                            </div>
                        )}

                        <h3 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-2 italic">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="font-[var(--font-bebas)] text-5xl tracking-tight text-white">{plan.price}</span>
                            {plan.price !== "Custom" && <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">/ month</span>}
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-8">
                            {plan.description}
                        </p>

                        <div className="space-y-4 mb-12 flex-1">
                            {plan.features.map((feature, j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <Check className="w-3 h-3 text-orange-500" />
                                    <span className="font-mono text-xs text-foreground/80">{feature}</span>
                                </div>
                            ))}
                            {plan.notIncluded.map((feature, j) => (
                                <div key={j} className="flex items-center gap-3 opacity-30">
                                    <X className="w-3 h-3" />
                                    <span className="font-mono text-xs line-through">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            className={`w-full h-12 rounded-none font-mono text-[10px] uppercase tracking-[0.2em] ${plan.highlighted ? 'bg-orange-600 hover:bg-orange-700' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            {plan.cta}
                        </Button>
                    </div>
                ))}
            </div>

            <div className="mt-24 max-w-2xl">
                <h3 className="font-[var(--font-bebas)] text-2xl tracking-widest text-white mb-6 uppercase italic">Frequently Asked</h3>
                <div className="space-y-8">
                    <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-2">Can I cancel?</h4>
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed">Yes, you can upgrade, downgrade, or cancel your subscription at any time. We believe in total flexibility.</p>
                    </div>
                    <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500 mb-2">What is the free tier limit?</h4>
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed">The free tier allows for 5,000 views per month. Once reached, we'll notify you to upgrade, but we never shut down your site without notice.</p>
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
