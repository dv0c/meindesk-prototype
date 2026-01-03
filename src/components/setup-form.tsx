"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createSite } from "@/lib/actions/site/create-site-action"
import { clearTeamsCache } from "@/hooks/useTeams"
import {
  Layout, Briefcase, User, Rocket, Globe, Home,
  FileText, Palette
} from "lucide-react"
import { toast } from "sonner"
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"
import { motion, AnimatePresence } from "framer-motion"

const BASE_DOMAIN = ".meindesk.gr"

const SITE_TYPES = [
  { id: "blog", title: "Blog", icon: FileText, desc: "Stories & News" },
  { id: "portfolio", title: "Portfolio", icon: User, desc: "Showcase Work" },
  { id: "business", title: "Business", icon: Briefcase, desc: "Company Profile" },
  { id: "landing", title: "Landing", icon: Rocket, desc: "Single Page" },
  { id: "store", title: "Store", icon: Globe, desc: "E-Commerce" },
  { id: "restaurant", title: "Restaurant", icon: Home, desc: "Menu & Booking" },
]

const DEFAULT_PAGES = [
  { id: "home", label: "Home", required: true },
  { id: "articles", label: "Articles", required: false },
  { id: "article", label: "Article Details", required: false },
  { id: "about", label: "About", required: false },
  { id: "contact", label: "Contact", required: false },
  { id: "portfolio", label: "Portfolio", required: false },
]

export function SetupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Form State
  const [siteType, setSiteType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [logo, setLogo] = useState("")
  const [selectedPages, setSelectedPages] = useState<string[]>(["home", "articles", "article"])
  const [selectedTheme, setSelectedTheme] = useState("core")

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalSteps = 4

  const canProceed = () => {
    if (step === 1) return !!siteType
    if (step === 2) return !!title.trim() && !!subdomain.trim()
    if (step === 3) return selectedPages.length > 0
    return true
  }

  const togglePage = (pageId: string) => {
    if (pageId === "home") return
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(p => p !== pageId)
        : [...prev, pageId]
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("subdomain", subdomain.toLowerCase())
      formData.append("url", `https://${subdomain.toLowerCase()}${BASE_DOMAIN}`)
      formData.append("logo", logo)
      formData.append("type", siteType)
      formData.append("pages", JSON.stringify(selectedPages))
      formData.append("theme", selectedTheme)

      const res = await createSite(formData)
      // @ts-ignore
      if (res?.error) throw new Error(res.error)

      clearTeamsCache()
      toast.success("INITIATING SITE SEQUENCE...")
      router.push(`/dashboard/${res.id}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "SYSTEM FAILURE")
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 bg-background text-foreground font-mono z-50 flex flex-col overflow-hidden">
      <AnimatedNoise opacity={0.05} />

      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-foreground/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center bg-foreground/5">
            <div className="w-2 h-2 bg-foreground/50" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            Initial Setup Sequence
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
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">

          <AnimatePresence mode="wait">
            {/* Step 1: Category Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                  SELECT TARGET PROTOCOL
                </h1>
                <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-16">
                                    // Define primary operational parameters
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
                  {SITE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSiteType(type.id)}
                      className={cn(
                        "group relative h-40 flex flex-col items-center justify-center gap-4 border transition-all duration-300",
                        siteType === type.id
                          ? "border-foreground bg-foreground/5"
                          : "border-foreground/20 hover:border-foreground/50 hover:bg-foreground/[0.02]"
                      )}
                    >
                      {/* Corner Markers */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-foreground/20 transition-all group-hover:w-4 group-hover:h-4 group-hover:border-foreground/40" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-foreground/20 transition-all group-hover:w-4 group-hover:h-4 group-hover:border-foreground/40" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-foreground/20 transition-all group-hover:w-4 group-hover:h-4 group-hover:border-foreground/40" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-foreground/20 transition-all group-hover:w-4 group-hover:h-4 group-hover:border-foreground/40" />

                      <type.icon className="w-8 h-8 stroke-1 text-foreground/70 group-hover:text-foreground transition-colors" />
                      <div className="text-center">
                        <div className="font-mono text-sm uppercase tracking-widest mb-1 group-hover:text-foreground transition-colors">
                          <ScrambleTextOnHover text={type.title} duration={0.3} />
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                          {type.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                  IDENTITY CONFIGURATION
                </h1>
                <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-16">
                                    // Assign unique identifiers
                </p>

                <div className="w-full max-w-lg space-y-12">
                  <div className="space-y-4">
                    <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Title Designation</Label>
                    <div className="relative group">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="ENTER SITE TITLE"
                        className="h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-2xl font-mono placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:border-foreground transition-all"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Network Address</Label>
                    <div className="flex items-end gap-2 font-mono text-xl border-b border-foreground/20 pb-4 relative group">
                      <span className="text-muted-foreground">https://</span>
                      <input
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                        placeholder="subdomain"
                        className="flex-1 bg-transparent border-none outline-none placeholder:text-foreground/20 uppercase"
                      />
                      <span className="text-muted-foreground">{BASE_DOMAIN}</span>
                      <div className="absolute bottom-[-1px] left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    {subdomain && (
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-green-500/80">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        AVAILABLE
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Manifesto (Optional)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="// ENTER DESCRIPTION..."
                      className="min-h-[100px] bg-transparent border border-foreground/20 rounded-none p-4 font-mono text-sm placeholder:text-foreground/20 focus-visible:ring-1 focus-visible:ring-foreground resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Pages */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                  SYSTEM MODULES
                </h1>
                <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-16">
                                    // Initialize required components
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10 w-full max-w-3xl">
                  {DEFAULT_PAGES.map((page) => (
                    <div
                      key={page.id}
                      onClick={() => togglePage(page.id)}
                      className={cn(
                        "relative p-6 bg-background cursor-pointer group transition-colors hover:bg-foreground/[0.02]",
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                          Module_0{DEFAULT_PAGES.indexOf(page) + 1}
                        </div>
                        <div className={cn(
                          "w-3 h-3 border border-foreground/40 transition-colors",
                          selectedPages.includes(page.id) ? "bg-foreground" : "bg-transparent"
                        )} />
                      </div>
                      <div className="font-[var(--font-bebas)] text-2xl tracking-wide">
                        {page.label}
                      </div>
                      {page.required && (
                        <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-widest text-foreground/40">
                          [ LOCKED ]
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Theme */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                  VISUAL MATRIX
                </h1>
                <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-16">
                                    // Select interface paradigm
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                  <div
                    className="cursor-pointer group relative"
                    onClick={() => setSelectedTheme("core")}
                  >
                    <div className={cn(
                      "aspect-video bg-background border border-foreground/20 p-1 transition-all duration-300",
                      selectedTheme === "core" ? "border-foreground" : "group-hover:border-foreground/50"
                    )}>
                      <div className="w-full h-full bg-foreground/[0.03] flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-foreground/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Abstract Preview */}
                        <div className="w-32 h-32 border border-foreground/10 rotate-45 flex items-center justify-center">
                          <div className="w-20 h-20 border border-foreground/10 -rotate-45" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-end border-b border-foreground/10 pb-2">
                      <div>
                        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">Theme_01</div>
                        <div className="font-[var(--font-bebas)] text-xl tracking-wide">CORE SYSTEM</div>
                      </div>
                      {selectedTheme === "core" && (
                        <div className="text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-1">Selected</div>
                      )}
                    </div>
                  </div>

                  <div className="opacity-50">
                    <div className="aspect-video border border-dashed border-foreground/20 flex flex-col items-center justify-center bg-foreground/[0.01]">
                      <Palette className="w-6 h-6 mb-4 text-foreground/20" />
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Uploading Data...
                      </div>
                    </div>
                    <div className="mt-4 border-b border-foreground/10 pb-2">
                      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">Theme_02</div>
                      <div className="font-[var(--font-bebas)] text-xl tracking-wide text-muted-foreground">COMING SOON</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/10 bg-background/80 backdrop-blur-sm relative z-10">
        <div className="px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Step 0{step} / 0{totalSteps}
            </div>
            {/* Industrial Steps Visualization */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
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

            <button
              onClick={step === totalSteps ? handleSubmit : () => setStep(s => Math.min(totalSteps, s + 1))}
              disabled={!canProceed() || loading}
              className="group relative px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                <ScrambleTextOnHover
                  text={loading ? "INITIALIZING..." : step === totalSteps ? "LAUNCH SYSTEM" : "PROCEED"}
                  as="span"
                  duration={0.3}
                />
                {!loading && <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">{">"}</span>}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}