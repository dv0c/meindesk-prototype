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
    children: React.ReactNode
    className?: string
}

export function PropertyRow({ label, children, className }: PropertyRowProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
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

interface PropertyColorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function PropertyColor({ value, onChange, placeholder }: PropertyColorProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-12 rounded-md border cursor-pointer bg-background"
            />
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "transparent"}
                className="flex-1 h-9 px-3 text-sm border rounded-md bg-background"
            />
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
    checked: boolean
    onChange: (checked: boolean) => void
}

export function PropertyCheckbox({ id, label, checked, onChange }: PropertyCheckboxProps) {
    return (
        <div className="flex items-center justify-between py-1">
            <label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer">
                {label}
            </label>
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
}

export function PropertySpacing({ values, onChange }: PropertySpacingProps) {
    return (
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
}

export function PropertyRichText({ value, onChange, label }: PropertyRichTextProps) {
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
            {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}

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
