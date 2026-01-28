import { Metadata } from "next"
import { MarketingPageWrapper } from "../../../components/marketing-page-wrapper"

export const metadata: Metadata = {
    title: "Domain Configuration — PROTOTYPE",
    description: "Learn how to configure custom domains and subdomains for your site.",
}

export default function DomainDocsPage() {
    return (
        <MarketingPageWrapper
            title="DOMAIN SETUP"
            subtitle="Configuration Guide"
        >
            <div className="max-w-4xl space-y-12">
                <div className="space-y-6">
                    <p className="font-mono text-lg text-foreground/70 leading-relaxed italic border-l-2 border-orange-500 pl-8">
                        Connect your custom domain to your PROTOTYPE site. We support both root domains (example.com) and subdomains (blog.example.com).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight uppercase">1. Add Your Domain</h3>
                        <p className="text-muted-foreground">
                            Go to your project dashboard, navigate to <strong>Settings &gt; Domains</strong>, and click the "Add Domain" button. Enter your desired domain name.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight uppercase">2. Configure DNS</h3>
                        <p className="text-muted-foreground">
                            Log in to your domain provider (e.g., GoDaddy, Namecheap) and add the following records:
                        </p>

                        <div className="space-y-6 border border-white/10 p-6 bg-white/[0.02]">
                            <div>
                                <h4 className="font-mono text-xs uppercase text-orange-500 mb-2">For Root Domains (example.com)</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm font-mono text-muted-foreground border-b border-white/5 pb-2">
                                    <span>Type</span>
                                    <span>Name</span>
                                    <span>Value</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm font-mono text-foreground pt-2">
                                    <span>A</span>
                                    <span>@</span>
                                    <span>76.76.21.21</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-mono text-xs uppercase text-orange-500 mb-2">For Subdomains (blog.example.com)</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm font-mono text-muted-foreground border-b border-white/5 pb-2">
                                    <span>Type</span>
                                    <span>Name</span>
                                    <span>Value</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm font-mono text-foreground pt-2">
                                    <span>CNAME</span>
                                    <span>blog</span>
                                    <span>cname.vercel-dns.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border border-orange-500/20 bg-orange-500/[0.05]">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-orange-500 mb-4">Verification</h3>
                    <p className="font-mono text-sm text-foreground/80">
                        After adding the records, it may take up to 48 hours for DNS changes to propagate.
                        You can check the status in your dashboard. Once verified, your site will be accessible via your custom domain.
                    </p>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
