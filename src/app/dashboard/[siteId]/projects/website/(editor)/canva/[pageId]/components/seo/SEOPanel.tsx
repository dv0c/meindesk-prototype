"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, Globe, Search, Share2, ImageIcon, AlertCircle, CheckCircle2, RotateCcw, Trash2 } from "lucide-react"
import { useSEO } from "./SEOContext"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import MediaLibraryDialog, { MediaItem } from "@/components/MediaGallery/media-select"

// Helper to calculate SEO score
const calculateSeoScore = (settings: any) => {
    let score = 0
    const checks = []

    // Title Check (30-60 chars)
    if (settings.title.length >= 30 && settings.title.length <= 60) {
        score += 25
        checks.push({ status: "pass", msg: "Title length is optimal" })
    } else if (settings.title.length > 0) {
        score += 10
        checks.push({ status: "warn", msg: settings.title.length < 30 ? "Title is too short" : "Title is too long" })
    } else {
        checks.push({ status: "fail", msg: "Title is missing" })
    }

    // Description Check (120-160 chars)
    if (settings.description.length >= 120 && settings.description.length <= 160) {
        score += 25
        checks.push({ status: "pass", msg: "Description length is optimal" })
    } else if (settings.description.length > 0) {
        score += 10
        checks.push({ status: "warn", msg: settings.description.length < 120 ? "Description is too short" : "Description is too long" })
    } else {
        checks.push({ status: "fail", msg: "Description is missing" })
    }

    // OG Image Check
    if (settings.ogImage) {
        score += 25
        checks.push({ status: "pass", msg: "Social share image is set" })
    } else {
        checks.push({ status: "fail", msg: "Missing social share image" })
    }

    // Favicon Check
    if (settings.favicon) {
        score += 25
        checks.push({ status: "pass", msg: "Favicon is set" })
    } else {
        checks.push({ status: "fail", msg: "Missing favicon" })
    }

    return { score, checks }
}

export function SEOPanel({ onBack }: { onBack: () => void }) {
    const { seoSettings, updateSEOSettings, resetSEOSettings } = useSEO()
    const [activeTab, setActiveTab] = useState<"general" | "social">("general")
    const { score, checks } = useMemo(() => calculateSeoScore(seoSettings), [seoSettings])

    // Media Dialog State
    const params = useParams()
    const siteId = params.siteId as string
    const [isMediaOpen, setIsMediaOpen] = useState(false)
    const [mediaTarget, setMediaTarget] = useState<"ogImage" | "favicon" | null>(null)

    const openMediaLibrary = (target: "ogImage" | "favicon") => {
        setMediaTarget(target)
        setIsMediaOpen(true)
    }

    const handleMediaSelect = (items: MediaItem[]) => {
        if (items.length > 0 && mediaTarget) {
            updateSEOSettings({ [mediaTarget]: items[0].url })
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <button onClick={onBack} className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">SEO Score</div>
                        <div className={cn("text-lg font-bold leading-none",
                            score >= 90 ? "text-green-500" :
                                score >= 50 ? "text-yellow-500" : "text-red-500"
                        )}>
                            {score}/100
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border-4 border-muted flex items-center justify-center relative">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-muted"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className={cn(
                                    score >= 90 ? "text-green-500" :
                                        score >= 50 ? "text-yellow-500" : "text-red-500"
                                )}
                                strokeDasharray={`${score}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content */}
            <motion.div
                className="flex-1 overflow-y-auto p-4 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >

                {/* Score Breakdown (Collapsible or always visible? Always visible summary) */}
                <motion.div variants={itemVariants} className="space-y-2 bg-muted/30 p-3 rounded-lg border">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Optimization Checklist
                    </h3>
                    <div className="space-y-1">
                        {checks.map((check, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                                {check.status === "pass" && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                {check.status === "warn" && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                                {check.status === "fail" && <AlertCircle className="w-3 h-3 text-red-500" />}
                                <span className={cn(
                                    check.status === "pass" ? "text-muted-foreground" : "text-foreground"
                                )}>{check.msg}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta Title</label>
                        <textarea
                            className="w-full p-2 text-sm bg-background border rounded-md focus:ring-1 focus:ring-primary outline-none resize-none"
                            placeholder="Page Title | Brand Name"
                            rows={2}
                            value={seoSettings.title}
                            onChange={(e) => updateSEOSettings({ title: e.target.value })}
                        />
                        <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">Recommended: 30-60 characters</span>
                            <span className={cn(
                                (seoSettings.title.length < 30 || seoSettings.title.length > 60) ? "text-orange-500" : "text-green-500"
                            )}>{seoSettings.title.length} chars</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta Description</label>
                        <textarea
                            className="w-full p-2 text-sm bg-background border rounded-md focus:ring-1 focus:ring-primary outline-none resize-none"
                            placeholder="A brief summary of the page content..."
                            rows={4}
                            value={seoSettings.description}
                            onChange={(e) => updateSEOSettings({ description: e.target.value })}
                        />
                        <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">Recommended: 120-160 characters</span>
                            <span className={cn(
                                (seoSettings.description.length < 120 || seoSettings.description.length > 160) ? "text-orange-500" : "text-green-500"
                            )}>{seoSettings.description.length} chars</span>
                        </div>
                    </div>
                </motion.div>

                {/* Search Preview */}
                <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        Google Search Preview
                    </label>
                    <div className="bg-card p-4 rounded-lg border shadow-sm font-sans">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center overflow-hidden text-[8px]">
                                {seoSettings.favicon ? <img src={seoSettings.favicon} alt="" className="w-full h-full object-cover" /> : "G"}
                            </div>
                            <div className="flex flex-col">
                                <span className="textxs text-[#202124]">example.com</span>
                                <span className="text-[10px] text-[#5f6368] -mt-0.5">https://example.com/page</span>
                            </div>
                        </div>
                        <div className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                            {seoSettings.title || "Your Page Title"}
                        </div>
                        <div className="text-[#4d5156] text-sm mt-1 line-clamp-2">
                            {seoSettings.description || "This is how your page description will look in Google search results. Make it catchy and relevant to improve click-through rates."}
                        </div>
                    </div>
                </motion.div>

                {/* Social Preview */}
                <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            Social Media Preview
                        </label>
                        {seoSettings.ogImage && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-destructive hover:text-destructive px-2"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    updateSEOSettings({ ogImage: "" })
                                }}
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove Image
                            </Button>
                        )}
                    </div>

                    <div
                        className="bg-card rounded-lg border shadow-sm overflow-hidden font-sans cursor-pointer group relative transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2"
                        onClick={() => openMediaLibrary("ogImage")}
                    >
                        <div className="aspect-[1.91/1] bg-muted relative flex items-center justify-center text-muted-foreground">
                            {seoSettings.ogImage ? (
                                <>
                                    <img src={seoSettings.ogImage} alt="Social Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            Change Image
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                                    <div className="p-3 bg-background/50 rounded-full">
                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                    </div>
                                    <span className="text-xs font-medium">Click to set Social Image</span>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-[#f0f2f5] dark:bg-muted/30 border-t relative">
                            <div className="uppercase text-[10px] text-muted-foreground font-semibold mb-0.5">EXAMPLE.COM</div>
                            <div className="font-bold text-sm text-[#050505] dark:text-foreground truncate">
                                {seoSettings.title || "Your Page Title"}
                            </div>
                            <div className="text-xs text-[#65676b] dark:text-muted-foreground mt-0.5 line-clamp-1">
                                {seoSettings.description || "Your page description..."}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    {/* Favicon Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground">Favicon</label>
                            {seoSettings.favicon && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] text-destructive hover:text-destructive px-2"
                                    onClick={() => updateSEOSettings({ favicon: "" })}
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Remove
                                </Button>
                            )}
                        </div>
                        <div className="flex items-start gap-3">
                            <div
                                onClick={() => openMediaLibrary("favicon")}
                                className={cn(
                                    "group relative w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 transition-all hover:bg-muted/10 hover:border-muted-foreground/50 cursor-pointer overflow-hidden flex items-center justify-center",
                                    seoSettings.favicon && "border-solid border-border bg-background p-0"
                                )}
                            >
                                {seoSettings.favicon ? (
                                    <>
                                        <img
                                            src={seoSettings.favicon}
                                            alt="Favicon"
                                            className="w-full h-full object-cover p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 bg-background/90 p-1.5 rounded-full shadow-sm">
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Globe className="w-6 h-6 text-muted-foreground/50" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="text-xs text-muted-foreground">
                                    Upload a square image (PNG or ICO) for your browser tab icon.
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-full text-xs"
                                    onClick={() => openMediaLibrary("favicon")}
                                >
                                    {seoSettings.favicon ? "Change Favicon" : "Select Favicon"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Indexing Toggle */}
                <motion.div variants={itemVariants} className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Prevent Indexing</span>
                        <span className="text-[10px] text-muted-foreground">Add noindex tag to this page</span>
                    </div>
                    <input
                        type="checkbox"
                        className="toggle"
                        checked={seoSettings.preventIndexing}
                        onChange={(e) => updateSEOSettings({ preventIndexing: e.target.checked })}
                    />
                </motion.div>
            </motion.div>


            <MediaLibraryDialog
                siteId={siteId}
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={handleMediaSelect}
                multiSelect={false}
            />
        </div >
    )
}
