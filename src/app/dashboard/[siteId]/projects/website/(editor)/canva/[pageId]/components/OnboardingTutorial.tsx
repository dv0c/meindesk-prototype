"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles, LayoutTemplate, Palette, Rocket } from "lucide-react"

interface Step {
    id: string
    title: string
    description: string
    icon: React.ReactNode
}

const steps: Step[] = [
    {
        id: "welcome",
        title: "WELCOME",
        description: "Your new powerful design workspace. Let's show you around in 30 seconds.",
        icon: <Sparkles className="w-6 h-6 text-white" />,
    },
    {
        id: "blocks",
        title: "DRAG & DROP",
        description: "Grab sections and elements from the sidebar. Drop them anywhere to build your layout instantly.",
        icon: <LayoutTemplate className="w-6 h-6 text-white" />,
    },
    {
        id: "design",
        title: "GLOBAL STYLES",
        description: "Control your entire site's look from one place. tweak colors, fonts, and spacing with the Design panel.",
        icon: <Palette className="w-6 h-6 text-white" />,
    },
    {
        id: "publish",
        title: "GO LIVE",
        description: "When you're ready, hit Publish. Your site will be live and shareable in seconds.",
        icon: <Rocket className="w-6 h-6 text-white" />,
    },
]

export function OnboardingTutorial({ onClose }: { onClose: () => void }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleClose()
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(onClose, 300)
        localStorage.setItem("hasSeenOnboarding", "true")
    }

    const step = steps[currentStep]

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-zinc-950 border border-zinc-800 rounded-none w-full max-w-sm overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* Thin top accent line */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-20" />

                        <div className="p-10 flex flex-col items-center text-center relative z-10">
                            {/* Icon Container - Minimal Hex/Square */}
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: "backOut" }}
                                className="w-16 h-16 border border-zinc-800 bg-zinc-900/50 flex items-center justify-center mb-8"
                            >
                                {step.icon}
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                key={`text-${step.id}`}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="space-y-4 mb-10"
                            >
                                <h2 className="text-xl font-bold tracking-[0.2em] text-white uppercase">
                                    {step.title}
                                </h2>
                                <p className="text-zinc-400 leading-relaxed text-sm px-2 font-light">
                                    {step.description}
                                </p>
                            </motion.div>

                            {/* Minimal Progress Line */}
                            <div className="flex gap-3 mb-10">
                                {steps.map((_, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={`h-[1px] transition-all duration-300 ${idx === currentStep ? "w-8 bg-white" : "w-4 bg-zinc-800"
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4 w-full">
                                <Button
                                    size="lg"
                                    onClick={handleNext}
                                    className="w-full gap-2 rounded-none bg-white text-black hover:bg-zinc-200 border-0 uppercase tracking-wider text-xs font-bold h-12"
                                >
                                    {currentStep === steps.length - 1 ? "ENTER STUDIO" : "NEXT"}
                                    {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3" />}
                                </Button>
                                <button
                                    onClick={handleClose}
                                    className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest"
                                >
                                    SKIP INTRO
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
