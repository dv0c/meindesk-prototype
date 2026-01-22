"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, ShieldCheck, Server, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Badge } from "@/components/ui/badge"

const steps = [
    { id: 1, label: "Input Domain" },
    { id: 2, label: "DNS Config" },
    { id: 3, label: "Verification" }
]

export function DomainSetupForm({ siteId }: { siteId: string }) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [domain, setDomain] = useState("")
    const [dnsConfig, setDnsConfig] = useState<any>(null)
    const [verificationStatus, setVerificationStatus] = useState<"pending" | "valid" | "invalid">("pending")

    const handleInputSubmit = async () => {
        if (!domain) return
        setLoading(true)
        try {
            // Add domain to Vercel via our API
            await axios.post(`/api/site/${siteId}/domains`, { domain })

            // Get config immediately
            const res = await axios.get(`/api/site/${siteId}/domains?domain=${domain}`)
            setDnsConfig(res.data.configJson)

            setStep(2)
        } catch (error: any) {
            toast.error(error.response?.data || "Failed to add domain")
        } finally {
            setLoading(false)
        }
    }

    const checkVerification = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/site/${siteId}/domains?domain=${domain}`)
            if (res.data.status === "Valid") {
                setVerificationStatus("valid")
                setStep(3)
            } else {
                setVerificationStatus("invalid")
                toast.error("Domain verification failed. Please check your DNS records.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to check verification")
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = () => {
        router.push(`/dashboard/${siteId}/projects/settings`)
    }

    return (
        <div className="fixed inset-0 bg-background text-foreground font-mono z-50 flex flex-col overflow-hidden">
            <AnimatedNoise opacity={0.05} />

            {/* Header */}
            <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-foreground/10 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center bg-foreground/5">
                        <Globe className="w-4 h-4 text-foreground/70" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:inline-block">
                        External Link Protocol
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:hidden">
                        Domain Setup
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="font-mono text-xs uppercase tracking-widest hover:bg-foreground/5"
                >
                    <ScrambleTextOnHover text="ABORT" />
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 px-4 py-8 md:px-6 md:py-12">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Input Domain */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center"
                            >
                                <h1 className="font-[var(--font-bebas)] text-3xl md:text-4xl lg:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                                    TARGET IDENTIFICATION
                                </h1>
                                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-16">
                                    // Enter external domain authority
                                </p>

                                <div className="w-full max-w-lg space-y-8">
                                    <div className="space-y-4">
                                        <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Domain Name</Label>
                                        <div className="relative group">
                                            <Input
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value)}
                                                placeholder="example.com"
                                                className="h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-xl md:text-2xl font-mono placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:border-foreground transition-all"
                                                onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Please enter the root domain (e.g., mydomain.com) or subdomain (e.g., app.mydomain.com).
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: DNS Configuration */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center"
                            >
                                <h1 className="font-[var(--font-bebas)] text-3xl md:text-4xl lg:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                                    DNS RECONFIGURATION
                                </h1>
                                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-16">
                                    // Update registrar records
                                </p>

                                <div className="w-full max-w-2xl bg-foreground/5 border border-foreground/10 p-6 md:p-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
                                        <Server className="w-5 h-5 text-foreground/60" />
                                        <span className="font-mono text-xs uppercase tracking-widest">Required Records</span>
                                    </div>

                                    <div className="grid gap-4">
                                        {/* A Record */}
                                        <div className="bg-background border border-foreground/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="font-mono text-xs">A</Badge>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Name</span>
                                                    <span className="font-mono text-sm">@</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:items-end">
                                                <span className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Value</span>
                                                <code className="font-mono text-sm bg-foreground/10 px-2 py-1 select-all">76.76.21.21</code>
                                            </div>
                                        </div>

                                        {/* CNAME Record */}
                                        <div className="bg-background border border-foreground/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="font-mono text-xs">CNAME</Badge>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Name</span>
                                                    <span className="font-mono text-sm">www</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:items-end">
                                                <span className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Value</span>
                                                <code className="font-mono text-sm bg-foreground/10 px-2 py-1 select-all">cname.vercel-dns.com</code>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-[10px] text-muted-foreground font-mono pt-2">
                                        CAUTION: DNS propagation may take up to 24 hours.
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-8">
                                    <ShieldCheck className="w-12 h-12 text-green-500" />
                                </div>
                                <h1 className="font-[var(--font-bebas)] text-3xl md:text-4xl lg:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                                    CONNECTION ESTABLISHED
                                </h1>
                                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 text-green-500/80">
                                    // Domain verified securely
                                </p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-foreground/10 bg-background/80 backdrop-blur-sm relative z-10 shrink-0">
                <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span className="hidden sm:inline">Phase</span> 0{step} / 03
                        </div>
                        <div className="hidden sm:flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-8 h-1 transition-all duration-300",
                                        i + 1 <= step ? "bg-foreground" : "bg-foreground/10"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {step < 3 && (
                            <Button
                                variant="ghost"
                                onClick={() => setStep(s => Math.max(1, s - 1))}
                                disabled={step === 1 || loading}
                                className={cn(
                                    "font-mono text-xs uppercase tracking-widest hover:bg-transparent hover:text-foreground/60 rounded-none px-4",
                                    step === 1 && "invisible"
                                )}
                            >
                                <span className="mr-2 text-xs">{"<"}</span>
                                BACK
                            </Button>
                        )}

                        <button
                            onClick={step === 1 ? handleInputSubmit : step === 2 ? checkVerification : handleFinish}
                            disabled={loading || (step === 1 && !domain)}
                            className="group relative px-4 md:px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <ScrambleTextOnHover
                                    text={loading ? "PROCESSING..." : step === 1 ? "INITIATE" : step === 2 ? "VERIFY UPLINK" : "COMPLETE"}
                                    as="span"
                                    duration={0.3}
                                />
                                {!loading && step < 3 && <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">{">"}</span>}
                            </span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}
