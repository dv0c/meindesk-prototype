"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDesign } from "./DesignContext"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"

// Color palette presets - exact values from Pagy.co [neutral, primary, secondary, tertiary]
const colorPalettes = [
    // Row 1
    { id: "monochrome", colors: ["#222222", "#000000", "#eeeeee", "#f8f8f8"] },
    { id: "corporate-blue", colors: ["#1a1b20", "#3a69f3", "#f0f0f2", "#f7f8f8"] },
    { id: "warm-coral", colors: ["#020826", "#f25042", "#eaddcf", "#f9f4ef"] },

    // Row 2
    { id: "modern-teal", colors: ["#34384f", "#62bfad", "#d0ece6", "#f9f7e8"] },
    { id: "soft-lavender", colors: ["#0d192a", "#c757c9", "#f8b8de", "#f1efe5"] },
    { id: "neon-contrast", colors: ["#000000", "#28e8ae", "#6e29ff", "#ededed"] },

    // Row 3
    { id: "forest-sage", colors: ["#282f3a", "#26d07c", "#dbe2e9", "#f5f5f1"] },
    { id: "ocean-pro", colors: ["#0052cc", "#1664d9", "#e7edf6", "#f2f7fd"] },
    { id: "violet-peach", colors: ["#4c39c3", "#c155d5", "#ffbca7", "#faf2e5"] },

    // Row 4
    { id: "slate-coral", colors: ["#334359", "#fd6574", "#e6e6e4", "#f9f5ef"] },
    { id: "mint-fresh", colors: ["#1a1b20", "#10b981", "#a7f3d0", "#ecfdf5"] },
    { id: "amber-warm", colors: ["#78350f", "#f59e0b", "#fde68a", "#fffbeb"] },

    // Row 5
    { id: "rose-soft", colors: ["#881337", "#f43f5e", "#fecdd3", "#fff1f2"] },
    { id: "purple-deep", colors: ["#4c1d95", "#8b5cf6", "#ddd6fe", "#f5f3ff"] },
    { id: "navy-gold", colors: ["#1e3a5f", "#fbbf24", "#f0f9ff", "#fffbeb"] },

    // Row 6 - Dark themes
    { id: "dark-blue", colors: ["#ffffff", "#3b82f6", "#1e3a8a", "#0f172a"] },
    { id: "dark-purple", colors: ["#f5f3ff", "#8b5cf6", "#4c1d95", "#1e1b4b"] },
    { id: "dark-emerald", colors: ["#ecfdf5", "#10b981", "#064e3b", "#022c22"] },
]

// Preset themes - exact values from Pagy.co
const presetThemes = [
    // Light themes - Row 1
    { id: "modern-blue", headingFont: "Inter", baseFont: "Inter", colors: ["#000000", "#2563eb", "#e2e8f0", "#f1f5f9"], buttonColor: "#2563eb", bgColor: "#ffffff" },
    { id: "warm-red", headingFont: "Instrument Sans", baseFont: "Instrument Sans", colors: ["#0f172a", "#ef4444", "#fef2f2", "#fafaf9"], buttonColor: "#ef4444", bgColor: "#fafaf9" },
    { id: "candy-pink", headingFont: "Clash Display", baseFont: "Clash Grotesk", colors: ["#1e1b4b", "#ec4899", "#fce7f3", "#f1f5f9"], buttonColor: "#ec4899", bgColor: "#f1f5f9" },

    // Light themes - Row 2
    { id: "corporate-blue", headingFont: "Syne", baseFont: "Space Grotesk", colors: ["#1e3a8a", "#3b82f6", "#dbeafe", "#f1f5f9"], buttonColor: "#3b82f6", bgColor: "#f1f5f9" },
    { id: "terracotta", headingFont: "Inconsolata", baseFont: "Karla", colors: ["#2d3748", "#e67e55", "#fdf2f0", "#fdf2f0"], buttonColor: "#e67e55", bgColor: "#fdf2f0" },
    { id: "fresh-teal", headingFont: "Bricolage Grotesque", baseFont: "Bricolage Grotesque", colors: ["#0a192f", "#00d1b2", "#ccf7ef", "#fffbe2"], buttonColor: "#00d1b2", bgColor: "#fffbe2" },

    // Light themes - Row 3
    { id: "royal-indigo", headingFont: "Instrument Serif", baseFont: "Instrument Sans", colors: ["#022c22", "#8b5cf6", "#ede9fe", "#fdf2f8"], buttonColor: "#8b5cf6", bgColor: "#fdf2f8" },
    { id: "earthy-gold", headingFont: "Fraunces", baseFont: "Mona Sans", colors: ["#3f3f1c", "#eab308", "#fef9c3", "#f5f5f4"], buttonColor: "#eab308", bgColor: "#f5f5f4" },
    { id: "classic-serif", headingFont: "Playfair Display", baseFont: "Libre Franklin", colors: ["#110011", "#0d9488", "#ccfbf1", "#f1f1f1"], buttonColor: "#0d9488", bgColor: "#f1f1f1" },

    // Light themes - Row 4
    { id: "bold-rounded", headingFont: "Pilcrow Rounded", baseFont: "Archivo", colors: ["#1e293b", "#ef4444", "#fee2e2", "#f1f5f9"], buttonColor: "#ef4444", bgColor: "#f1f5f9" },
    { id: "minimal", headingFont: "Inter", baseFont: "Inter", colors: ["#1a1a1a", "#1a1a1a", "#e5e5e5", "#f5f5f5"], buttonColor: "#1a1a1a", bgColor: "#ffffff" },
    { id: "emerald", headingFont: "Inter", baseFont: "Inter", colors: ["#064e3b", "#10b981", "#a7f3d0", "#ecfdf5"], buttonColor: "#10b981", bgColor: "#ffffff" },

    // Dark themes
    { id: "dark-indigo", headingFont: "Inter", baseFont: "Inter", colors: ["#ffffff", "#6366f1", "#312e81", "#0f172a"], buttonColor: "#6366f1", bgColor: "#0f172a" },
    { id: "dark-orange", headingFont: "Pilcrow Rounded", baseFont: "Archivo", colors: ["#ffffff", "#f97316", "#431407", "#18181b"], buttonColor: "#f97316", bgColor: "#18181b" },
    { id: "dark-purple", headingFont: "Inter", baseFont: "Inter", colors: ["#f5f3ff", "#8b5cf6", "#4c1d95", "#1e1b4b"], buttonColor: "#8b5cf6", bgColor: "#1e1b4b" },
    { id: "dark-emerald", headingFont: "Inter", baseFont: "Inter", colors: ["#ecfdf5", "#10b981", "#064e3b", "#022c22"], buttonColor: "#10b981", bgColor: "#022c22" },
]

type ViewType = "main" | "colors" | "fonts" | "buttons" | "forms"

// Current design state
interface DesignState {
    background: string
    neutral: string
    primary: string
    secondary: string
    tertiary: string
    selectedPalette: string | null
}

interface DesignCardProps {
    title: string
    children: React.ReactNode
    onClick?: () => void
}

function DesignCard({ title, children, onClick }: DesignCardProps) {
    return (
        <button
            onClick={onClick}
            className="flex w-full flex-col p-4 h-full bg-card rounded-xl border border-border hover:border-foreground/30 hover:shadow-sm transition-all text-left group"
        >
            <div className="flex items-center justify-between w-full mb-3">
                <span className="text-sm font-medium text-foreground">{title}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 flex items-center justify-center w-full">
                {children}
            </div>
        </button>
    )
}

interface ThemeCardProps {
    theme: typeof presetThemes[0]
    isSelected?: boolean
    onClick?: () => void
}

function ThemeCard({ theme, isSelected, onClick }: ThemeCardProps) {
    const isDark = theme.bgColor !== "#ffffff" && !theme.bgColor.startsWith("#f")
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-xl transition-all border",
                isSelected
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background border-transparent"
                    : "border-border/50 hover:border-border"
            )}
            style={{ backgroundColor: theme.bgColor }}
        >
            {/* Left side: Aa + Button */}
            <div className="flex items-center gap-2">
                {/* Typography Preview */}
                <span
                    className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}
                    style={{ fontFamily: theme.headingFont }}
                >
                    Aa
                </span>

                {/* Button Preview */}
                <span
                    className="px-2 py-0.5 text-[9px] font-medium text-white rounded-full"
                    style={{ backgroundColor: theme.buttonColor }}
                >
                    Button
                </span>
            </div>

            {/* Right side: Color Circles */}
            <div className="flex -space-x-1">
                {theme.colors.map((color, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "w-4 h-4 rounded-full",
                            isDark ? "border border-white/30" : "border border-black/10"
                        )}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
        </button>
    )
}

// Colors Detail Panel
function ColorsPanel({ onBack, design, setDesign }: {
    onBack: () => void
    design: DesignState
    setDesign: (d: DesignState) => void
}) {
    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium">
                    Save
                </button>
            </div>

            <h2 className="text-2xl font-bold">Colors</h2>

            {/* Color Inputs with Popovers */}
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="flex-1 p-3 rounded-lg border text-left hover:ring-1 hover:ring-primary"
                            style={{ borderColor: design.background === "#ffffff" ? "#e5e7eb" : design.background }}
                        >
                            <span className="text-xs text-muted-foreground">Background</span>
                            <div className="text-sm font-mono">{design.background}</div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                            color={design.background}
                            onChange={(color) => setDesign({ ...design, background: color })}
                        />
                        <input
                            className="mt-2 w-full px-2 py-1 text-sm border rounded"
                            value={design.background}
                            onChange={(e) => setDesign({ ...design, background: e.target.value })}
                        />
                    </PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="flex-1 p-3 rounded-lg text-left text-white hover:ring-1 hover:ring-primary"
                            style={{ backgroundColor: design.neutral }}
                        >
                            <span className="text-xs opacity-70">Neutral</span>
                            <div className="text-sm font-mono">{design.neutral}</div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                            color={design.neutral}
                            onChange={(color) => setDesign({ ...design, neutral: color })}
                        />
                        <input
                            className="mt-2 w-full px-2 py-1 text-sm border rounded"
                            value={design.neutral}
                            onChange={(e) => setDesign({ ...design, neutral: e.target.value })}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="flex-1 p-3 rounded-lg text-left text-white hover:ring-1 hover:ring-primary"
                            style={{ backgroundColor: design.primary }}
                        >
                            <span className="text-xs opacity-70">Primary</span>
                            <div className="text-sm font-mono">{design.primary}</div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                            color={design.primary}
                            onChange={(color) => setDesign({ ...design, primary: color })}
                        />
                        <input
                            className="mt-2 w-full px-2 py-1 text-sm border rounded"
                            value={design.primary}
                            onChange={(e) => setDesign({ ...design, primary: e.target.value })}
                        />
                    </PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="flex-1 p-3 rounded-lg border text-left hover:ring-1 hover:ring-primary"
                        >
                            <span className="text-xs text-muted-foreground">Secondary</span>
                            <div className="text-sm font-mono">{design.secondary}</div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                            color={design.secondary}
                            onChange={(color) => setDesign({ ...design, secondary: color })}
                        />
                        <input
                            className="mt-2 w-full px-2 py-1 text-sm border rounded"
                            value={design.secondary}
                            onChange={(e) => setDesign({ ...design, secondary: e.target.value })}
                        />
                    </PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="flex-1 p-3 rounded-lg border text-left hover:ring-1 hover:ring-primary"
                        >
                            <span className="text-xs text-muted-foreground">Tertiary</span>
                            <div className="text-sm font-mono">{design.tertiary}</div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                            color={design.tertiary}
                            onChange={(color) => setDesign({ ...design, tertiary: color })}
                        />
                        <input
                            className="mt-2 w-full px-2 py-1 text-sm border rounded"
                            value={design.tertiary}
                            onChange={(e) => setDesign({ ...design, tertiary: e.target.value })}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Palettes */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Palettes</h3>
                <div className="grid grid-cols-3 gap-3">
                    {colorPalettes.map((palette) => (
                        <button
                            key={palette.id}
                            onClick={() => setDesign({
                                ...design,
                                neutral: palette.colors[0],
                                primary: palette.colors[1],
                                secondary: palette.colors[2],
                                tertiary: palette.colors[3],
                                selectedPalette: palette.id,
                            })}
                            className={cn(
                                "p-3 rounded-xl border flex justify-center",
                                design.selectedPalette === palette.id
                                    ? "border-foreground ring-1 ring-foreground"
                                    : "border-border/50 hover:border-border"
                            )}
                        >
                            <div className="flex -space-x-1">
                                {palette.colors.map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Button shape and style options
const buttonShapes = [
    { id: "rounded", label: "Rounded", borderRadius: "9999px" },
    { id: "pill", label: "Pill", borderRadius: "9999px" },
    { id: "soft", label: "Soft", borderRadius: "8px" },
    { id: "square", label: "Square", borderRadius: "9999px" },
]

const buttonStyles = [
    { id: "filled-outline", filledBg: true, outlineBg: false },
    { id: "filled-ghost", filledBg: true, outlineBg: false },
    { id: "soft-outline", filledBg: true, outlineBg: false },
    { id: "filled-dark", filledBg: true, outlineBg: true },
]

// Buttons Detail Panel
function ButtonsPanel({ onBack, primaryColor }: { onBack: () => void; primaryColor: string }) {
    const { settings, updateSettings } = useDesign()
    const [selectedStyle, setSelectedStyle] = useState("filled-outline")

    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium">
                    Save
                </button>
            </div>

            <h2 className="text-2xl font-bold">Buttons</h2>

            {/* Shape */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Shape</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: "rounded", radius: "9999px" },
                        { id: "pill", radius: "9999px" },
                        { id: "soft", radius: "6px" },
                        { id: "square", radius: "0px" },
                    ].map((shape) => (
                        <button
                            key={shape.id}
                            onClick={() => updateSettings({ buttonShape: shape.id as any })}
                            className={cn(
                                "p-6 rounded-xl border flex items-center justify-center",
                                settings.buttonShape === shape.id
                                    ? "border-foreground ring-1 ring-foreground"
                                    : "border-border/50 hover:border-border"
                            )}
                        >
                            <span
                                className="px-4 py-2 text-sm font-medium text-white"
                                style={{ backgroundColor: primaryColor, borderRadius: shape.radius }}
                            >
                                Button
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Style */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: "style-1", btn1: "filled-primary", btn2: "outline-primary" },
                        { id: "style-2", btn1: "outline-single", btn2: null },
                        { id: "style-3", btn1: "outline-primary", btn2: "ghost" },
                        { id: "style-4", btn1: "filled-primary", btn2: "filled-secondary" },
                        { id: "style-5", btn1: "filled-accent", btn2: "outline-primary" },
                        { id: "style-6", btn1: "filled-muted", btn2: "outline-muted" },
                    ].map((style) => {
                        const borderRadius = settings.buttonShape === "square" ? "4px"
                            : settings.buttonShape === "soft" ? "8px"
                                : "9999px"

                        const renderButton = (type: string) => {
                            const baseClass = "px-4 py-2 text-sm font-medium"

                            switch (type) {
                                case "filled-primary":
                                    return (
                                        <span
                                            className={cn(baseClass, "bg-foreground text-background")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                case "filled-secondary":
                                    return (
                                        <span
                                            className={cn(baseClass, "bg-muted text-foreground")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                case "filled-accent":
                                    return (
                                        <span
                                            className={cn(baseClass, "bg-blue-500 text-white")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                case "filled-muted":
                                    return (
                                        <span
                                            className={cn(baseClass, "bg-muted-foreground/60 text-background")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                case "outline-primary":
                                    return (
                                        <span
                                            className={cn(baseClass, "bg-transparent border-2 border-foreground text-foreground")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                case "outline-muted":
                                    return (
                                        <span
                                            className={cn(baseClass, "bg-transparent border-2 border-muted-foreground/60 text-muted-foreground")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                case "ghost":
                                    return (
                                        <span
                                            className={cn(baseClass, "text-muted-foreground")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                case "outline-single":
                                    return (
                                        <span
                                            className={cn("px-6 py-2.5 text-sm font-medium bg-transparent border-2 border-foreground text-foreground")}
                                            style={{ borderRadius }}
                                        >
                                            Button
                                        </span>
                                    )
                                default:
                                    return null
                            }
                        }

                        return (
                            <button
                                key={style.id}
                                onClick={() => {
                                    setSelectedStyle(style.id)
                                    updateSettings({ buttonStyle: style.btn1.includes("filled") ? "filled" : "outline" as any })
                                }}
                                className={cn(
                                    "p-5 rounded-2xl flex items-center justify-center gap-2 transition-all",
                                    selectedStyle === style.id
                                        ? "border-[3px] border-foreground"
                                        : "border border-border hover:border-border/80"
                                )}
                            >
                                {renderButton(style.btn1)}
                                {style.btn2 && renderButton(style.btn2)}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Size */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: "sm", label: "Small" },
                        { id: "md", label: "Medium" },
                        { id: "lg", label: "Large" },
                    ].map((size) => (
                        <button
                            key={size.id}
                            onClick={() => updateSettings({ buttonSize: size.id as any })}
                            className={cn(
                                "py-3 rounded-lg border text-sm font-medium transition-all",
                                settings.buttonSize === size.id
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border hover:border-foreground/50"
                            )}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Border */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Border</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: "0", label: "None" },
                        { id: "1", label: "1px" },
                        { id: "2", label: "2px" },
                    ].map((border) => (
                        <button
                            key={border.id}
                            onClick={() => updateSettings({ buttonBorder: border.id as any })}
                            className={cn(
                                "py-3 rounded-lg border text-sm font-medium transition-all",
                                settings.buttonBorder === border.id
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border hover:border-foreground/50"
                            )}
                        >
                            {border.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Forms Panel
function FormsPanel({ onBack }: { onBack: () => void }) {
    const { settings, updateSettings } = useDesign()

    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium">
                    Save
                </button>
            </div>

            <h2 className="text-2xl font-bold">Forms</h2>

            {/* Shape */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Shape</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: "rounded", radius: "9999px", label: "Rounded" },
                        { id: "pill", radius: "9999px", label: "Pill" },
                        { id: "soft", radius: "6px", label: "Soft" },
                        { id: "square", radius: "0px", label: "Square" },
                    ].map((shape) => (
                        <button
                            key={shape.id}
                            onClick={() => updateSettings({ formShape: shape.id as any })}
                            className={cn(
                                "p-4 rounded-xl border flex items-center justify-center",
                                settings.formShape === shape.id
                                    ? "border-foreground ring-1 ring-foreground"
                                    : "border-border/50 hover:border-border"
                            )}
                        >
                            <div
                                className="w-full h-10 border-2 border-border bg-muted/30 flex items-center px-3"
                                style={{ borderRadius: shape.radius }}
                            >
                                <span className="text-sm text-muted-foreground">Field</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Style */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: "fill", label: "Fill" },
                        { id: "outline", label: "Outline" },
                    ].map((style) => {
                        const borderRadius = settings.formShape === "square" ? "0px"
                            : settings.formShape === "soft" ? "6px"
                                : "9999px"

                        return (
                            <button
                                key={style.id}
                                onClick={() => updateSettings({ formStyle: style.id as any })}
                                className={cn(
                                    "p-4 rounded-xl border flex items-center justify-center",
                                    settings.formStyle === style.id
                                        ? "border-foreground ring-1 ring-foreground"
                                        : "border-border/50 hover:border-border"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-full h-10 flex items-center px-3",
                                        style.id === "fill"
                                            ? "bg-muted border-0"
                                            : "bg-transparent border-2 border-border"
                                    )}
                                    style={{ borderRadius }}
                                >
                                    <span className="text-sm text-muted-foreground">Field</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// Font options - supporting both Google Fonts and Fontshare
interface FontPairing {
    id: string
    heading: string
    body: string
    type?: "google" | "fontshare" // Default to google if undefined
}

const fontPairings: FontPairing[] = [
    // --- Sans-serif Pairings ---
    { id: "inter", heading: "Inter", body: "Inter" }, // Google
    { id: "poppins-inter", heading: "Poppins", body: "Inter" }, // Google
    { id: "clash-display", heading: "Clash Display", body: "Clash Grotesk", type: "fontshare" },
    { id: "plein-switzer", heading: "Plein", body: "Switzer", type: "fontshare" },
    { id: "bricolage-manrope", heading: "Bricolage Grotesque", body: "Manrope" }, // Google
    { id: "syne-space", heading: "Syne", body: "Space Grotesk" }, // Google
    { id: "pilcrow-archivo", heading: "Pilcrow Rounded", body: "Archivo", type: "fontshare" },
    { id: "outfit-switzer", heading: "Outfit", body: "Switzer", type: "fontshare" }, // Outfit is Google, Switzer is Fontshare - mixed need handling
    { id: "oswald-source", heading: "Oswald", body: "Source Sans 3" }, // Google
    { id: "roboto-inconsolata", heading: "Roboto", body: "Inconsolata" }, // Google
    { id: "general-gambetta", heading: "General Sans", body: "Gambetta", type: "fontshare" },
    { id: "chubbo-supreme", heading: "Chubbo", body: "Supreme", type: "fontshare" },

    // --- Serif Pairings ---
    { id: "instrument", heading: "Instrument Serif", body: "Instrument Sans" }, // Google
    { id: "libre-caslon", heading: "Libre Caslon Condensed", body: "Inter" }, // Google (Text/Condensed)
    { id: "ibm-plex", heading: "IBM Plex Serif", body: "IBM Plex Sans" }, // Google
    { id: "merriweather", heading: "Merriweather", body: "Merriweather Sans" }, // Google
    { id: "fraunces-mona", heading: "Fraunces", body: "Mona Sans", type: "fontshare" }, // Fraunces is Google, Mona is Fontshare
    { id: "bespoke-serif", heading: "Bespoke Serif", body: "Bespoke Sans", type: "fontshare" },
    { id: "alegreya", heading: "Alegreya", body: "Source Sans 3" }, // Google
    { id: "fraunces-inter", heading: "Fraunces", body: "Inter" }, // Google
    { id: "playfair", heading: "Playfair Display", body: "Libre Franklin" }, // Google
    { id: "boska-switzer", heading: "Boska", body: "Switzer", type: "fontshare" },
    { id: "roboto-slab", heading: "Roboto Slab", body: "Open Sans" }, // Google

    // --- Monospace / Tech ---
    { id: "inconsolata-karla", heading: "Inconsolata", body: "Karla" }, // Google
    { id: "jetbrains", heading: "JetBrains Mono", body: "JetBrains Mono" }, // Google
    { id: "space-lora", heading: "Space Grotesk", body: "Lora" }, // Google

    // --- Single/Other Fonts (as options) --- 
    { id: "general-sans", heading: "General Sans", body: "General Sans", type: "fontshare" },
    { id: "satoshi", heading: "Satoshi", body: "Satoshi", type: "fontshare" },
    { id: "cabinet", heading: "Cabinet Grotesk", body: "Cabinet Grotesk", type: "fontshare" },
    { id: "supreme", heading: "Supreme", body: "Supreme", type: "fontshare" },
    { id: "switzer", heading: "Switzer", body: "Switzer", type: "fontshare" },
    { id: "work-sans", heading: "Work Sans", body: "Work Sans" }, // Google
    { id: "figtree", heading: "Figtree", body: "Figtree" }, // Google
    { id: "source-sans", heading: "Source Sans 3", body: "Source Sans 3" }, // Google
]

// Determine if a specific font name is likely Fontshare based on known list if type isn't explicit on the pair
// Or simply load all unique names from their respective sources. 
const isFontshare = (fontName: string) => {
    const fontshareFonts = [
        "General Sans", "Clash Display", "Clash Grotesk", "Plein", "Switzer",
        "Pilcrow Rounded", "Gambetta", "Chubbo", "Supreme", "Mona Sans",
        "Bespoke Serif", "Bespoke Sans", "Boska", "Satoshi", "Cabinet Grotesk"
    ]
    return fontshareFonts.includes(fontName)
}

// Fonts Detail Panel
function FontsPanel({ onBack }: { onBack: () => void }) {
    const { settings, updateSettings } = useDesign()
    const [selectedPairing, setSelectedPairing] = useState("inter")

    // Load ALL fonts for previews on mount
    useEffect(() => {
        // 1. Google Fonts
        const googleFonts = new Set<string>()
        const fontshareFonts = new Set<string>()

        fontPairings.forEach(p => {
            // Check Heading
            if (p.type === "fontshare" || isFontshare(p.heading)) fontshareFonts.add(p.heading)
            else googleFonts.add(p.heading)

            // Check Body
            if (p.type === "fontshare" || isFontshare(p.body)) fontshareFonts.add(p.body)
            else googleFonts.add(p.body)
        })

        // -- Load Google Fonts --
        if (googleFonts.size > 0) {
            const fontQuery = Array.from(googleFonts).map(f => f.replace(/ /g, "+") + ":wght@400;500;600;700").join("&family=")
            const linkId = "design-all-google-fonts"
            if (!document.getElementById(linkId)) {
                const link = document.createElement("link")
                link.id = linkId
                link.rel = "stylesheet"
                link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`
                document.head.appendChild(link)
            }
        }

        // -- Load Fontshare Fonts --
        if (fontshareFonts.size > 0) {
            // Fontshare uses kebab-case in URL: api.fontshare.com/v2/css?f[]=general-sans@500,600,700&f[]=clash-display@...
            const fsQuery = Array.from(fontshareFonts).map(f => {
                const kebab = f.toLowerCase().replace(/ /g, "-")
                return `f[]=${kebab}@300,400,500,600,700` // Requesting common weights
            }).join("&")

            const linkId = "design-all-fontshare-fonts"
            if (!document.getElementById(linkId)) {
                const link = document.createElement("link")
                link.id = linkId
                link.rel = "stylesheet"
                link.href = `https://api.fontshare.com/v2/css?${fsQuery}&display=swap`
                document.head.appendChild(link)
            }
        }

    }, [])

    // Also ensure selected fonts are loaded for canvas
    useEffect(() => {
        const fonts = [settings.baseFont, settings.headingFont].filter(f => f && f !== "inherit")
        if (fonts.length === 0) return

        const googleToLoad = new Set<string>()
        const fontshareToLoad = new Set<string>()

        fonts.forEach(f => {
            if (isFontshare(f)) fontshareToLoad.add(f)
            else googleToLoad.add(f)
        })

        // Google
        if (googleToLoad.size > 0) {
            const fontQuery = Array.from(googleToLoad).map(f => f.replace(/ /g, "+") + ":wght@300;400;500;600;700").join("&family=")
            const linkId = "design-selected-google-fonts"
            const existing = document.getElementById(linkId)
            if (existing) existing.remove()

            const link = document.createElement("link")
            link.id = linkId
            link.rel = "stylesheet"
            link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`
            document.head.appendChild(link)
        }

        // Fontshare
        if (fontshareToLoad.size > 0) {
            const fsQuery = Array.from(fontshareToLoad).map(f => {
                const kebab = f.toLowerCase().replace(/ /g, "-")
                return `f[]=${kebab}@300,400,500,600,700`
            }).join("&")

            const linkId = "design-selected-fontshare-fonts"
            const existing = document.getElementById(linkId)
            if (existing) existing.remove()

            const link = document.createElement("link")
            link.id = linkId
            link.rel = "stylesheet"
            link.href = `https://api.fontshare.com/v2/css?${fsQuery}&display=swap`
            document.head.appendChild(link)
        }

    }, [settings.baseFont, settings.headingFont])

    return (
        <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <h2 className="text-2xl font-bold">Fonts</h2>

            {/* Base Font */}
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Base</label>
                <select
                    value={settings.baseFont}
                    onChange={(e) => updateSettings({ baseFont: e.target.value })}
                    className="w-full h-10 px-3 border rounded-lg bg-background text-sm"
                >
                    {/* Unique base fonts from pairings */}
                    {Array.from(new Set(fontPairings.map(p => p.body))).sort().map((font) => (
                        <option key={font} value={font}>{font}</option>
                    ))}
                </select>
            </div>

            {/* Headings */}
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Headings</label>
                <div className="flex gap-2">
                    <select
                        value={settings.headingFont}
                        onChange={(e) => updateSettings({ headingFont: e.target.value })}
                        className="flex-1 h-10 px-3 border rounded-lg bg-background text-sm"
                    >
                        {/* Unique heading fonts from pairings */}
                        {Array.from(new Set(fontPairings.map(p => p.heading))).sort().map((font) => (
                            <option key={font} value={font}>{font}</option>
                        ))}
                    </select>
                    <select
                        value={settings.headingWeight}
                        onChange={(e) => updateSettings({ headingWeight: e.target.value })}
                        className="w-28 h-10 px-3 border rounded-lg bg-background text-sm"
                    >
                        <option value="Light">Light</option>
                        <option value="Regular">Regular</option>
                        <option value="Medium">Medium</option>
                        <option value="SemiBold">SemiBold</option>
                        <option value="Bold">Bold</option>
                    </select>
                </div>
            </div>

            {/* Pairings */}
            <div className="space-y-3">
                <h3 className="text-base font-medium">Pairings</h3>
                <div className="grid grid-cols-2 gap-3">
                    {fontPairings.map((pairing) => (
                        <button
                            key={pairing.id}
                            onClick={() => {
                                setSelectedPairing(pairing.id)
                                updateSettings({ baseFont: pairing.body, headingFont: pairing.heading })
                            }}
                            className={cn(
                                "p-4 rounded-xl border text-left bg-card hover:bg-muted/50 transition-colors",
                                // Simple check if currect settings match this pairing
                                (settings.headingFont === pairing.heading && settings.baseFont === pairing.body)
                                    ? "border-foreground ring-1 ring-foreground"
                                    : "border-border/50 hover:border-border"
                            )}
                        >
                            <div className="text-lg font-semibold" style={{ fontFamily: pairing.heading }}>
                                {pairing.heading}
                            </div>
                            <div className="text-sm text-muted-foreground" style={{ fontFamily: pairing.body }}>
                                {pairing.body}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function DesignPanel() {
    const [view, setView] = useState<ViewType>("main")
    const { settings, updateSettings } = useDesign()

    // Map context settings to local design state format for sub-panels
    const design: DesignState = {
        background: settings.background,
        neutral: settings.neutral,
        primary: settings.primary,
        secondary: settings.secondary,
        tertiary: settings.tertiary,
        selectedPalette: settings.selectedPalette,
    }

    const setDesign = (newDesign: DesignState) => {
        updateSettings({
            background: newDesign.background,
            neutral: newDesign.neutral,
            primary: newDesign.primary,
            secondary: newDesign.secondary,
            tertiary: newDesign.tertiary,
            selectedPalette: newDesign.selectedPalette,
        })
    }

    // Preload all fonts used in theme presets for preview
    useEffect(() => {
        const uniqueFonts = new Set<string>()
        presetThemes.forEach(theme => {
            uniqueFonts.add(theme.headingFont)
            uniqueFonts.add(theme.baseFont)
        })

        // Helper to check if font is Fontshare
        const isFontshare = (fontName: string) => {
            const fontshareFonts = [
                "General Sans", "Clash Display", "Clash Grotesk", "Plein", "Switzer",
                "Pilcrow Rounded", "Gambetta", "Chubbo", "Supreme", "Mona Sans",
                "Bespoke Serif", "Bespoke Sans", "Boska", "Satoshi", "Cabinet Grotesk"
            ]
            return fontshareFonts.includes(fontName)
        }

        const googleFonts = new Set<string>()
        const fontshareFonts = new Set<string>()

        uniqueFonts.forEach(f => {
            if (isFontshare(f)) fontshareFonts.add(f)
            else googleFonts.add(f)
        })

        // Load Google Fonts for theme previews
        if (googleFonts.size > 0) {
            const fontQuery = Array.from(googleFonts).map(f => f.replace(/ /g, "+") + ":wght@400;500;600;700").join("&family=")
            const linkId = "design-theme-preview-google-fonts"
            if (!document.getElementById(linkId)) {
                const link = document.createElement("link")
                link.id = linkId
                link.rel = "stylesheet"
                link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`
                document.head.appendChild(link)
            }
        }

        // Load Fontshare Fonts for theme previews
        if (fontshareFonts.size > 0) {
            const fsQuery = Array.from(fontshareFonts).map(f => {
                const kebab = f.toLowerCase().replace(/ /g, "-")
                return `f[]=${kebab}@400,500,600,700`
            }).join("&")

            const linkId = "design-theme-preview-fontshare-fonts"
            if (!document.getElementById(linkId)) {
                const link = document.createElement("link")
                link.id = linkId
                link.rel = "stylesheet"
                link.href = `https://api.fontshare.com/v2/css?${fsQuery}&display=swap`
                document.head.appendChild(link)
            }
        }
    }, [])

    // Animation variants for panel transitions
    const panelVariants = {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 }
    }

    const renderPanel = () => {
        switch (view) {
            case "colors":
                return (
                    <motion.div
                        key="colors"
                        variants={panelVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <ColorsPanel onBack={() => setView("main")} design={design} setDesign={setDesign} />
                    </motion.div>
                )
            case "fonts":
                return (
                    <motion.div
                        key="fonts"
                        variants={panelVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <FontsPanel onBack={() => setView("main")} />
                    </motion.div>
                )
            case "buttons":
                return (
                    <motion.div
                        key="buttons"
                        variants={panelVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <ButtonsPanel onBack={() => setView("main")} primaryColor={design.primary} />
                    </motion.div>
                )
            case "forms":
                return (
                    <motion.div
                        key="forms"
                        variants={panelVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <FormsPanel onBack={() => setView("main")} />
                    </motion.div>
                )
            default:
                return (
                    <motion.div
                        key="main"
                        variants={panelVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="p-4 space-y-6"
                    >
                        {/* Header */}
                        <motion.h2
                            className="text-2xl font-bold tracking-tight"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                        >
                            Design
                        </motion.h2>

                        {/* Card Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {
                                    title: "Colors", content: (
                                        <div className="flex -space-x-3">
                                            <div className="w-12 h-12 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: design.neutral }} />
                                            <div className="w-12 h-12 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: design.primary }} />
                                            <div className="w-12 h-12 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: design.secondary }} />
                                        </div>
                                    ), view: "colors" as ViewType
                                },
                                {
                                    title: "Fonts", content: (
                                        <div className="text-left w-full">
                                            <div className="text-lg font-semibold" style={{ fontFamily: settings.headingFont }}>{settings.headingFont}</div>
                                            <div className="text-sm text-muted-foreground" style={{ fontFamily: settings.baseFont }}>{settings.baseFont}</div>
                                        </div>
                                    ), view: "fonts" as ViewType
                                },
                                {
                                    title: "Buttons", content: (
                                        <span className="px-5 py-2 text-white text-sm font-medium rounded-full inline-block" style={{ backgroundColor: design.primary }}>
                                            Button
                                        </span>
                                    ), view: "buttons" as ViewType
                                },
                                {
                                    title: "Forms", content: (
                                        <div className="w-full">
                                            <div className="w-full h-10 px-3 flex items-center bg-background border border-border rounded-lg text-sm text-muted-foreground">
                                                Field
                                            </div>
                                        </div>
                                    ), view: "forms" as ViewType
                                },
                            ].map((card, idx) => (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                                    className="h-full"
                                >
                                    <DesignCard title={card.title} onClick={() => setView(card.view)}>
                                        {card.content}
                                    </DesignCard>
                                </motion.div>
                            ))}
                        </div>

                        {/* Themes Section */}
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.35 }}
                        >
                            <h3 className="text-lg font-semibold">Themes</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {presetThemes.map((theme, idx) => (
                                    <motion.div
                                        key={theme.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2, delay: 0.4 + idx * 0.02 }}
                                    >
                                        <ThemeCard
                                            theme={theme}
                                            isSelected={settings.selectedTheme === theme.id}
                                            onClick={() => {
                                                updateSettings({
                                                    selectedTheme: theme.id,
                                                    neutral: theme.colors[0],
                                                    primary: theme.buttonColor,
                                                    secondary: theme.colors[2],
                                                    tertiary: theme.colors[3],
                                                    background: theme.bgColor,
                                                    headingFont: theme.headingFont,
                                                    baseFont: theme.baseFont,
                                                })
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )
        }
    }

    return (
        <AnimatePresence mode="wait">
            {renderPanel()}
        </AnimatePresence>
    )
}
