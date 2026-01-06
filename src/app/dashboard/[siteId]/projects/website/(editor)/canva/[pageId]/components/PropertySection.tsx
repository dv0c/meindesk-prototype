"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, AlignCenter, AlignLeft, AlignRight, AlignJustify, ArrowDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Code, Trash2 } from "lucide-react"
import { Editor } from "@/components/blocks/editor-x/editor"
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $generateHtmlFromNodes } from '@lexical/html'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface PropertySectionProps {
    title: string
    summary?: string
    children: React.ReactNode
    defaultOpen?: boolean
}

export function PropertySection({
    title,
    summary,
    children,
    defaultOpen = true,
}: PropertySectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className={cn(
                "border-b transition-colors",
                isOpen || isHovered ? "border-border" : "border-transparent"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors text-left"
            >
                <span className="font-medium text-sm">{title}</span>
                <div className="flex items-center gap-2">
                    {summary && !isOpen && (
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {summary}
                        </span>
                    )}
                    <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

interface PropertyRowProps {
    label: string
    description?: string
    children: React.ReactNode
    className?: string
}

export function PropertyRow({ label, description, children, className }: PropertyRowProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex flex-col gap-0.5">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                {description && <p className="text-[10px] text-muted-foreground/70">{description}</p>}
            </div>
            {children}
        </div>
    )
}

interface PropertyInputProps {
    type?: "text" | "number" | "color" | "url"
    value: string | number
    onChange: (value: string) => void
    placeholder?: string
    min?: number
    max?: number
    step?: number
    className?: string
}

export function PropertyInput({
    type = "text",
    value,
    onChange,
    placeholder,
    min,
    max,
    step,
    className,
}: PropertyInputProps) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={cn(
                "w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                className
            )}
        />
    )
}

interface PropertySliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    unit?: string
}

export function PropertySlider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit = "px",
}: PropertySliderProps) {
    return (
        <div className="space-y-1">
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{min}{unit}</span>
                <span className="font-medium text-foreground">{value}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    )
}

interface PropertySliderWithUnitProps {
    value: number
    unit: string
    onChange: (value: number, unit: string) => void
    min?: number
    max?: number
    step?: number
    units?: string[]
}

export function PropertySliderWithUnit({
    value,
    unit,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    units = ["px", "%", "rem", "vw"],
}: PropertySliderWithUnitProps) {
    // Adjust max based on unit
    const getMaxForUnit = (u: string) => {
        switch (u) {
            case "%": return 100
            case "vw": return 100
            case "rem": return 50
            case "px": return 1200
            default: return max
        }
    }

    const currentMax = getMaxForUnit(unit)
    const clampedValue = Math.min(value, currentMax)

    return (
        <div className="space-y-1">
            <input
                type="range"
                value={clampedValue}
                onChange={(e) => onChange(parseInt(e.target.value), unit)}
                min={min}
                max={currentMax}
                step={step}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{min}{unit}</span>
                <span className="font-medium text-foreground">{clampedValue}{unit}</span>
                <div className="flex items-center gap-1">
                    <span>{currentMax}</span>
                    <select
                        value={unit}
                        onChange={(e) => onChange(value, e.target.value)}
                        className="h-5 px-1 text-xs border rounded bg-background cursor-pointer"
                    >
                        {units.map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Palette, X } from "lucide-react"
import { useDesign } from "./DesignContext"

interface PropertyColorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function PropertyColor({ value, onChange, placeholder }: PropertyColorProps) {
    const { settings } = useDesign()
    const isVariable = value?.startsWith("var(--")

    // Map design settings to CSS variables for the palette
    const DESIGN_COLORS = [
        { name: 'Primary', variable: 'var(--primary)', color: settings.primary },
        { name: 'Background', variable: 'var(--background)', color: settings.background },
        { name: 'Neutral', variable: 'var(--foreground)', color: settings.neutral },
        { name: 'Secondary', variable: 'var(--muted)', color: settings.secondary }, // Mapped to muted in design system
        { name: 'Tertiary', variable: 'var(--design-tertiary)', color: settings.tertiary },
        // Add hardcoded defaults for others if needed, using standard CSS vars
        { name: 'Light', variable: 'var(--primary-foreground)', color: '#ffffff' },
        { name: 'Border', variable: 'var(--border)', color: settings.secondary },
    ]

    // Resolve color for preview
    const resolveColor = (val: string) => {
        if (!val) return null
        if (!val.startsWith('var(--')) return val

        // Try to find matching variable in our design set
        const match = DESIGN_COLORS.find(c => c.variable === val)
        if (match) return match.color

        // Fallback for unknown variables (can't resolve easily without ref, show gray)
        return '#808080'
    }

    const previewColor = isVariable ? resolveColor(value) : value

    return (
        <div className="flex items-center gap-2">
            {!isVariable ? (
                <input
                    type="color"
                    value={value || "#000000"}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 w-9 rounded-md border cursor-pointer bg-background p-1"
                />
            ) : (
                <div
                    className="h-9 w-9 rounded-md border bg-background p-1 relative group cursor-help"
                    title={`Variable: ${value}\nResovled: ${previewColor}`}
                >
                    <div
                        className="w-full h-full rounded-sm border shadow-sm"
                        style={{ backgroundColor: previewColor || 'transparent' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white text-[8px] font-mono rounded-sm pointer-events-none">
                        VAR
                    </div>
                </div>
            )}

            <div className="flex-1 flex gap-2">
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "transparent"}
                    className="flex-1 h-9 px-3 text-sm border rounded-md bg-background min-w-0"
                />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                            <Palette className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                        <div className="space-y-3">
                            <div className="font-medium text-xs text-muted-foreground pb-2 border-b">Design System Colors</div>
                            <div className="grid grid-cols-4 gap-2">
                                {DESIGN_COLORS.map((color) => (
                                    <button
                                        key={color.variable}
                                        onClick={() => onChange(color.variable)}
                                        className="group relative flex flex-col items-center gap-1"
                                        title={`${color.name} (${color.variable})`}
                                    >
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-md border shadow-sm transition-transform hover:scale-105",
                                                value === color.variable && "ring-2 ring-primary ring-offset-2"
                                            )}
                                            style={{ backgroundColor: color.color }}
                                        />
                                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                                            {color.name}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2 border-t mt-2">
                                <p className="text-[10px] text-muted-foreground mb-2 px-1">
                                    Linked to global design settings.
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-8 text-xs"
                                    onClick={() => onChange("")}
                                >
                                    <X className="h-3 w-3 mr-2" />
                                    Clear Color
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

interface PropertySelectProps {
    value: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
}

export function PropertySelect({ value, onChange, options }: PropertySelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}

interface PropertyButtonGroupProps {
    value: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
}

export function PropertyButtonGroup({ value, onChange, options }: PropertyButtonGroupProps) {
    return (
        <div className="flex gap-1">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "flex-1 h-8 px-2 text-xs border rounded-md transition-colors capitalize",
                        value === option.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}


interface PropertyIconButtonGroupProps {
    value: string
    onChange: (value: string) => void
    options: {
        value: string
        label: string
        icon: React.ElementType
    }[]
}

export function PropertyIconButtonGroup({ value, onChange, options }: PropertyIconButtonGroupProps) {
    return (
        <div className="flex rounded-md border bg-muted/50 p-1">
            {options.map((option) => {
                const Icon = option.icon
                return (
                    <button
                        key={option.value}
                        className={cn(
                            "flex-1 flex justify-center p-1 rounded-sm transition-all",
                            value === option.value
                                ? "bg-background shadow-sm text-foreground"
                                : "hover:bg-background/50 text-muted-foreground"
                        )}
                        onClick={() => onChange(option.value)}
                        title={option.label}
                    >
                        <Icon size={16} />
                    </button>
                )
            })}
        </div>
    )
}

interface PropertyCheckboxProps {
    id: string
    label: string
    description?: string
    checked: boolean
    onChange: (checked: boolean) => void
}

export function PropertyCheckbox({ id, label, description, checked, onChange }: PropertyCheckboxProps) {
    return (
        <div className="flex items-center justify-between py-1">
            <div className="flex flex-col gap-0.5">
                <label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer">
                    {label}
                </label>
                {description && <p className="text-[10px] text-muted-foreground/70">{description}</p>}
            </div>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onChange}
            />
        </div>
    )
}


interface PropertyToggleProps {
    value: boolean
    onChange: (checked: boolean) => void
    label?: string
}

export function PropertyToggle({ value, onChange, label }: PropertyToggleProps) {
    return (
        <div className="flex items-center justify-between">
            {label && <span className="text-xs text-muted-foreground">{label}</span>}
            <Switch
                checked={value}
                onCheckedChange={onChange}
            />
        </div>
    )
}


interface PropertySpacingProps {
    values: Partial<Record<"top" | "right" | "bottom" | "left", string>>
    onChange: (side: "top" | "right" | "bottom" | "left", value: string) => void
    unit?: string
    onUnitChange?: (unit: string) => void
}

export function PropertySpacing({ values, onChange, unit, onUnitChange }: PropertySpacingProps) {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side} className="relative">
                        <input
                            value={values[side] || ""}
                            onChange={(e) => onChange(side, e.target.value)}
                            placeholder={side.charAt(0).toUpperCase() + side.slice(1)}
                            className="w-full h-8 px-2 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                ))}
            </div>
            {onUnitChange && (
                <div className="flex justify-end">
                    <select
                        value={unit || 'px'}
                        onChange={(e) => onUnitChange(e.target.value)}
                        className="h-6 px-2 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        {['px', '%', 'em', 'rem', 'auto'].map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}

interface PropertyShadowSelectProps {
    value: string
    onChange: (value: string) => void
}

export function PropertyShadowSelect({ value, onChange }: PropertyShadowSelectProps) {
    const shadowOptions = [
        { label: "None", value: "none", css: "none" },
        { label: "Small", value: "sm", css: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
        { label: "Medium", value: "md", css: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
        { label: "Large", value: "lg", css: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
        { label: "Extra Large", value: "xl", css: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" },
        { label: "2XL", value: "2xl", css: "0 25px 50px -12px rgb(0 0 0 / 0.25)" },
    ]

    // Helper to find the matching preset key from the CSS value
    const currentPreset = shadowOptions.find(opt => opt.css === value || (value && opt.css !== "none" && value.includes(opt.css)))?.value || "custom"

    const handleChange = (newValue: string) => {
        const option = shadowOptions.find(opt => opt.value === newValue)
        if (option) {
            onChange(option.css)
        }
    }

    return (
        <div className="space-y-2">
            <select
                value={currentPreset === "custom" ? "" : currentPreset}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {currentPreset === "custom" && <option value="custom">Custom</option>}
                {shadowOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {/* Show raw input only if it's a custom value not matching presets, or maybe just always show it for advanced users?
                For now, let's keep it simple as per request 'more user friendly'. 
                We can add a toggle for 'Advanced' later if needed.
            */}
        </div>
    )
}

interface PropertyRichTextProps {
    value: string
    onChange: (value: string) => void
    label?: string
    description?: string
}

export function PropertyRichText({ value, onChange, label, description }: PropertyRichTextProps) {
    const [open, setOpen] = useState(false)
    const [editorInstance, setEditorInstance] = useState<any>(null)
    const [pendingState, setPendingState] = useState<string | null>(null)

    // Extract HTML for preview
    let htmlContent = ""
    try {
        if (value && value.trim().startsWith('{')) {
            const parsed = JSON.parse(value)
            if (parsed.html) htmlContent = parsed.html
        } else if (value && value.includes('<')) {
            htmlContent = value
        }
    } catch { }

    const handleSave = () => {
        if (pendingState) {
            onChange(pendingState)
        }
        setOpen(false)
    }

    return (
        <div className="space-y-2">
            <div>
                {label && <label className="text-xs font-medium text-muted-foreground block">{label}</label>}
                {description && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{description}</p>}
            </div>

            <div className="space-y-2 border rounded-md p-3 bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Rich Text Content</span>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onChange("")}
                            title="Clear content"
                        >
                            Clear
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setOpen(true)}
                            title="Edit in Rich Text Editor"
                        >
                            <Code className="h-3 w-3 mr-1" />
                            Edit in Editor
                        </Button>
                    </div>
                </div>
                {htmlContent ? (
                    <div
                        className="text-xs text-muted-foreground prose prose-sm max-w-none overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        style={{ maxHeight: '100px', overflow: 'hidden' }}
                    />
                ) : (
                    <div className="text-xs text-muted-foreground italic p-2 text-center">
                        Empty content
                    </div>
                )}

            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-[95vw]! overflow-auto w-[95vw] h-[95vh] max-h-[95vh] flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle className="text-xl">Edit {label || "Content"}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto px-6 relative flex flex-col">
                        <Editor
                            editorSerializedState={(() => {
                                try {
                                    if (value && value.trim().startsWith('{')) {
                                        const parsed = JSON.parse(value)
                                        if (parsed.editorState) {
                                            return parsed.editorState
                                        }
                                        return parsed
                                    }
                                    return undefined
                                } catch (e) {
                                    return undefined
                                }
                            })()}
                            onEditorReady={setEditorInstance}
                            onChange={(editorState) => {
                                if (!editorInstance) return;

                                editorState.read(() => {
                                    const html = $generateHtmlFromNodes(editorInstance, null)
                                    const payload = JSON.stringify({
                                        html: html,
                                        editorState: editorState.toJSON()
                                    })
                                    setPendingState(payload)
                                })
                            }}
                        />
                    </div>

                    <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface BoxModelInputProps {
    value: string | number
    onChange: (value: string) => void
    className?: string
    placeholder?: string
}

function BoxModelInput({ value, onChange, className, placeholder }: BoxModelInputProps) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-8 h-6 text-[10px] text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 hover:bg-black/10 rounded cursor-text",
                className
            )}
            placeholder={placeholder || "-"}
            onClick={(e) => (e.target as HTMLInputElement).select()}
        />
    )
}

interface PropertyBoxModelProps {
    margin: Record<"top" | "right" | "bottom" | "left", string | number>
    padding: Record<"top" | "right" | "bottom" | "left", string | number>
    onChangeMargin: (side: "top" | "right" | "bottom" | "left", value: string) => void
    onChangePadding: (side: "top" | "right" | "bottom" | "left", value: string) => void
}

export function PropertyBoxModel({ margin, padding, onChangeMargin, onChangePadding }: PropertyBoxModelProps) {
    return (
        <div className="flex justify-center text-[10px] select-none">
            {/* Margin Box (Outer) */}
            <div className="relative bg-[#F9CC9D]/80 dark:bg-[#F9CC9D]/40 border border-[#F9CC9D] border-dashed rounded p-6 flex flex-col items-center justify-center gap-1 group/margin">
                <span className="absolute top-1 left-2 text-[9px] text-muted-foreground/50 uppercase tracking-tighter mix-blend-multiply dark:mix-blend-lighten">Margin</span>

                {/* Margin Inputs */}
                <BoxModelInput value={margin.top} onChange={(v) => onChangeMargin("top", v)} className="absolute top-1 left-1/2 -translate-x-1/2" />
                <BoxModelInput value={margin.right} onChange={(v) => onChangeMargin("right", v)} className="absolute right-1 top-1/2 -translate-y-1/2" />
                <BoxModelInput value={margin.bottom} onChange={(v) => onChangeMargin("bottom", v)} className="absolute bottom-1 left-1/2 -translate-x-1/2" />
                <BoxModelInput value={margin.left} onChange={(v) => onChangeMargin("left", v)} className="absolute left-1 top-1/2 -translate-y-1/2" />

                {/* Padding Box (Inner) */}
                <div className="relative bg-[#C3E3B4]/80 dark:bg-[#C3E3B4]/40 border border-[#C3E3B4] border-dashed rounded p-6 flex flex-col items-center justify-center group/padding w-full h-full min-w-[140px]">
                    <span className="absolute top-1 left-2 text-[9px] text-muted-foreground/50 uppercase tracking-tighter mix-blend-multiply dark:mix-blend-lighten">Padding</span>

                    {/* Padding Inputs */}
                    <BoxModelInput value={padding.top} onChange={(v) => onChangePadding("top", v)} className="absolute top-1 left-1/2 -translate-x-1/2" />
                    <BoxModelInput value={padding.right} onChange={(v) => onChangePadding("right", v)} className="absolute right-1 top-1/2 -translate-y-1/2" />
                    <BoxModelInput value={padding.bottom} onChange={(v) => onChangePadding("bottom", v)} className="absolute bottom-1 left-1/2 -translate-x-1/2" />
                    <BoxModelInput value={padding.left} onChange={(v) => onChangePadding("left", v)} className="absolute left-1 top-1/2 -translate-y-1/2" />

                    {/* Content Box (Innermost) */}
                    <div className="bg-[#9FC4E7]/80 dark:bg-[#9FC4E7]/40 border border-[#9FC4E7] rounded w-full py-2 flex items-center justify-center text-xs text-muted-foreground/70 min-h-[24px]">
                        Content
                    </div>
                </div>
            </div>
        </div>
    )
}
