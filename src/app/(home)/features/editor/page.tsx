import { Metadata } from "next"
import { MarketingPageWrapper } from "../../components/marketing-page-wrapper"

export const metadata: Metadata = {
    title: "Drag & Drop Editor — PROTOTYPE",
    description: "Experience the fluid interaction of our live visual editor. Build yours with zero latency and deep customization.",
}

export default function EditorPage() {
    return (
        <MarketingPageWrapper
            title="DRAG & DROP"
            subtitle="Intuitive Interaction"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                <div className="space-y-12">
                    <h2 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight italic">LIVE VISUAL EDITING</h2>
                    <p className="font-mono text-lg text-foreground/70 leading-relaxed">
                        What you see is exactly what your readers get. Our editor is built on the philosophy of fluid interaction.
                        No more switching between dashboard and preview.
                    </p>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500">Zero Latency</h4>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase leading-relaxed">
                                Experience real-time feedback with every drag and resize.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-orange-500">Component Props</h4>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase leading-relaxed">
                                Deep customization through a refined sidebar interface.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative h-[500px] border border-white/10 bg-white/[0.02] flex items-center justify-center p-8 overflow-hidden">
                    {/* Note: In a real app, the animated placeholder should be moved to a client component if it needs direct motion hooks in the page. 
                        However, MarketingPageWrapper itself is a client component and can handle animations of its children if passed as props, 
                        or we can just leave this as is since MarketingPageWrapper is client-side. */}
                    <div className="w-full max-w-sm aspect-[4/3] bg-neutral-900 border border-white/10 shadow-2xl relative">
                        <div className="absolute top-0 left-0 right-0 h-6 bg-white/5 flex items-center px-2 gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        </div>
                        <div className="p-8 pt-12 space-y-4">
                            <div className="w-full h-8 bg-orange-500/20 border border-orange-500/30" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-24 bg-white/5 border border-white/10" />
                                <div className="h-24 bg-white/5 border border-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingPageWrapper>
    )
}
