"use client"

import { cn } from "@/lib/utils"
import type { NavPlacement } from "@/lib/category-metadata"

interface NavPlacementPickerProps {
    value: NavPlacement
    onChange: (value: NavPlacement) => void
}

const options: { value: NavPlacement; label: string; description: string }[] = [
    { value: "header", label: "Header", description: "Top-level nav link" },
    { value: "hidden", label: "Dropdown", description: "Inside articles menu" },
    { value: "none", label: "Hidden", description: "Not in navigation" },
]

function HeaderSvg({ active }: { active: boolean }) {
    const accent = active ? "var(--primary)" : "currentColor"
    const accentOpacity = active ? 1 : 0.25
    return (
        <svg viewBox="0 0 120 80" fill="none" className="w-full h-full">
            {/* Browser chrome */}
            <rect x="0" y="0" width="120" height="80" rx="6" className="fill-muted/50 stroke-border" strokeWidth="1" />
            {/* Header bar */}
            <rect x="0" y="0" width="120" height="20" rx="6" className="fill-muted stroke-border" strokeWidth="1" />
            <rect x="0" y="10" width="120" height="10" className="fill-muted" />
            {/* Logo */}
            <rect x="6" y="6" width="16" height="8" rx="2" className="fill-muted-foreground/30" />
            {/* Nav items */}
            <rect x="50" y="8" width="14" height="4" rx="1" className="fill-muted-foreground/20" />
            {/* Highlighted nav item */}
            <rect x="68" y="7" width="18" height="6" rx="2" fill={accent} opacity={accentOpacity} />
            <rect x="90" y="8" width="14" height="4" rx="1" className="fill-muted-foreground/20" />
            {/* Content lines */}
            <rect x="10" y="30" width="60" height="4" rx="1" className="fill-muted-foreground/10" />
            <rect x="10" y="38" width="45" height="4" rx="1" className="fill-muted-foreground/10" />
            <rect x="10" y="46" width="55" height="4" rx="1" className="fill-muted-foreground/10" />
        </svg>
    )
}

function DropdownSvg({ active }: { active: boolean }) {
    const accent = active ? "var(--primary)" : "currentColor"
    const accentOpacity = active ? 1 : 0.25
    return (
        <svg viewBox="0 0 120 80" fill="none" className="w-full h-full">
            {/* Browser chrome */}
            <rect x="0" y="0" width="120" height="80" rx="6" className="fill-muted/50 stroke-border" strokeWidth="1" />
            {/* Header bar */}
            <rect x="0" y="0" width="120" height="20" rx="6" className="fill-muted stroke-border" strokeWidth="1" />
            <rect x="0" y="10" width="120" height="10" className="fill-muted" />
            {/* Logo */}
            <rect x="6" y="6" width="16" height="8" rx="2" className="fill-muted-foreground/30" />
            {/* Nav items */}
            <rect x="50" y="8" width="14" height="4" rx="1" className="fill-muted-foreground/20" />
            <rect x="68" y="8" width="18" height="4" rx="1" className="fill-muted-foreground/20" />
            <rect x="90" y="8" width="14" height="4" rx="1" className="fill-muted-foreground/20" />
            {/* Dropdown panel */}
            <rect x="62" y="20" width="36" height="30" rx="3" className="fill-background stroke-border" strokeWidth="1" />
            {/* Dropdown items */}
            <rect x="66" y="25" width="28" height="4" rx="1" className="fill-muted-foreground/15" />
            {/* Highlighted dropdown item */}
            <rect x="65" y="32" width="30" height="6" rx="2" fill={accent} opacity={accentOpacity} />
            <rect x="66" y="41" width="28" height="4" rx="1" className="fill-muted-foreground/15" />
        </svg>
    )
}

function HiddenSvg({ active }: { active: boolean }) {
    return (
        <svg viewBox="0 0 120 80" fill="none" className="w-full h-full">
            {/* Browser chrome */}
            <rect x="0" y="0" width="120" height="80" rx="6" className="fill-muted/50 stroke-border" strokeWidth="1" />
            {/* Header bar - dimmed */}
            <rect x="0" y="0" width="120" height="20" rx="6" className="fill-muted stroke-border" strokeWidth="1" />
            <rect x="0" y="10" width="120" height="10" className="fill-muted" />
            {/* Logo */}
            <rect x="6" y="6" width="16" height="8" rx="2" className="fill-muted-foreground/15" />
            {/* Nav items - very faded */}
            <rect x="50" y="8" width="14" height="4" rx="1" className="fill-muted-foreground/10" />
            <rect x="68" y="8" width="18" height="4" rx="1" className="fill-muted-foreground/10" />
            <rect x="90" y="8" width="14" height="4" rx="1" className="fill-muted-foreground/10" />
            {/* Strike-through line over header */}
            <line
                x1="44" y1="16" x2="110" y2="4"
                className={active ? "stroke-primary" : "stroke-muted-foreground/30"}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Content lines */}
            <rect x="10" y="30" width="60" height="4" rx="1" className="fill-muted-foreground/10" />
            <rect x="10" y="38" width="45" height="4" rx="1" className="fill-muted-foreground/10" />
            <rect x="10" y="46" width="55" height="4" rx="1" className="fill-muted-foreground/10" />
        </svg>
    )
}

const svgMap: Record<NavPlacement, React.FC<{ active: boolean }>> = {
    header: HeaderSvg,
    hidden: DropdownSvg,
    none: HiddenSvg,
}

export function NavPlacementPicker({ value, onChange }: NavPlacementPickerProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => {
                const SvgComponent = svgMap[opt.value]
                const selected = value === opt.value
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "group relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 pt-2.5 pb-2 transition-all text-muted-foreground hover:text-foreground",
                            selected
                                ? "border-primary bg-primary/5 text-foreground shadow-sm"
                                : "border-transparent bg-muted/30 hover:border-border hover:bg-muted/50"
                        )}
                    >
                        <div className="w-full aspect-[3/2] rounded overflow-hidden">
                            <SvgComponent active={selected} />
                        </div>
                        <div className="text-center">
                            <div className={cn(
                                "text-[11px] font-semibold leading-tight",
                                selected ? "text-primary" : "text-foreground"
                            )}>
                                {opt.label}
                            </div>
                            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                                {opt.description}
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
