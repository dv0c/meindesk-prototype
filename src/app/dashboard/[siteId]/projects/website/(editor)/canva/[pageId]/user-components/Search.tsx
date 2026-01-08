"use client"

import { useTeam } from "@/hooks/useTeam"
import { cn } from "@/lib/utils"
import { useEditor, useNode } from "@craftjs/core"
import { Check, ChevronsUpDown, Search as SearchIcon, X } from "lucide-react"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
// @ts-ignore
import ContentEditable from "react-contenteditable"

import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getCollections } from "@/lib/actions/collection-actions"
import {
    PropertyColor,
    PropertyInput,
    PropertyRow,
    PropertySection,
    PropertySlider
} from "../components/PropertySection"
import { SearchOverlay } from "./SearchOverlay"

// No longer using fixed available collections
// const AVAILABLE_COLLECTIONS = ["Articles", "Products", "Documentation"]

interface SearchProps {
    placeholder?: string
    width?: string
    padding?: number
    backgroundColor?: string
    color?: string
    borderRadius?: number
    collections?: string[]
    overlayTheme?: "minimal" | "dashboard" | "classic" | "modern"
}

export const Search = ({
    placeholder = "Search...",
    width = "100%",
    padding = 12,
    backgroundColor = "#ffffff",
    color = "#6b7280",
    borderRadius = 8,
    collections = [],
    overlayTheme = "minimal"
}: SearchProps) => {
    const { connectors: { connect, drag }, actions: { setProp }, selected, isHovered } = useNode((state) => ({
        selected: state.events.selected,
        isHovered: state.events.hovered,
    }))

    // In the editor, verify if we are in "preview" or "enabled" mode
    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }))

    // Determine siteId based on context
    // 1. If params.tenantId exists, we are in the Live Site (Tenant View). ALWAYS use it.
    // 2. If valid team.id exists (Editor/Dashboard), use it.
    // 3. Fallback to params.siteId.
    const params = useParams()
    const { team } = useTeam(undefined, 'tenant')
    const siteId = (params.tenantId as string) || team?.id || (params.siteId as string)

    const [open, setOpen] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
        // Only open the search overlay if the editor is NOT enabled (i.e. we are in preview/live mode)
        // OR if the user explicitly wants to test it.
        // Usually, in edit mode, clicking selects the component.
        // e.stopPropagation() is handled by wrapper if needed, but here we want normal behavior.
        if (!enabled) {
            setOpen(true)
        }
    }

    // Allow editing placeholder in editor
    const handlePlaceholderChange = (e: any) => {
        setProp((props: any) => props.placeholder = e.target.value)
    }

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            className="w-full relative group"
            style={{ width }}
        >
            {/* The Search Bar UI */}
            <div
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-3 border transition-all cursor-text hover:border-primary/50",
                    "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                )}
                style={{
                    padding: `${padding}px`,
                    backgroundColor,
                    color,
                    borderRadius: `${borderRadius}px`,
                }}
            >
                <SearchIcon style={{ width: 18, height: 18, opacity: 0.7 }} />

                {enabled ? (
                    <ContentEditable
                        html={placeholder}
                        disabled={!enabled}
                        onChange={handlePlaceholderChange}
                        tagName="span"
                        className="flex-1 outline-none min-w-[50px]"
                    />
                ) : (
                    <span className="flex-1 opacity-80 select-none">{placeholder}</span>
                )}

                {/* Visual indicator for shortcut */}
                <span className="text-xs opacity-50 border rounded px-1.5 py-0.5">⌘K</span>
            </div>

            {/* The Overlay - only mounted when open */}
            <SearchOverlay
                open={open}
                onOpenChange={setOpen}
                onOpenChange={setOpen}
                collections={collections}
                siteId={siteId}
                theme="light"
                layout={overlayTheme}
            />

            {/* Editor-only visual indicator of selected collections */}
            {enabled && isHovered && (
                <div className="absolute top-full left-0 mt-1 text-[10px] bg-black text-white px-2 py-1 rounded shadow-lg z-50">
                    Searching: {collections.length > 0 ? `${collections.length} collections` : "All"}
                </div>
            )}
        </div>
    )
}

export const SearchSettings = () => {
    const {
        actions: { setProp },
        collections,
        placeholder,
        width,
        padding,
        backgroundColor,
        color,
        borderRadius,
        overlayTheme
    } = useNode((node) => ({
        collections: node.data.props.collections || [],
        placeholder: node.data.props.placeholder,
        width: node.data.props.width,
        padding: node.data.props.padding,
        backgroundColor: node.data.props.backgroundColor,
        color: node.data.props.color,
        borderRadius: node.data.props.borderRadius,
        overlayTheme: node.data.props.overlayTheme,
    }))

    const params = useParams()
    const siteId = params.siteId as string
    const [availableCollections, setAvailableCollections] = useState<{ label: string, value: string }[]>([])
    const [openCombobox, setOpenCombobox] = useState(false)

    // Fetch collections on mount
    useEffect(() => {
        if (!siteId) return
        const fetchCollections = async () => {
            const res = await getCollections(siteId)

            const options = [
                { label: "Articles", value: "Articles" } // Hardcoded option
            ]

            if (res.collections) {
                res.collections.forEach(c => {
                    options.push({
                        label: c.name,
                        value: c.id
                    })
                })
            }
            setAvailableCollections(options)
        }
        fetchCollections()
    }, [siteId])

    const toggleCollection = (collectionId: string) => {
        setProp((props: any) => {
            const current = props.collections || []
            if (current.includes(collectionId)) {
                props.collections = current.filter((c: string) => c !== collectionId)
            } else {
                props.collections = [...current, collectionId]
            }
        })
    }

    // Get labels for selected collections
    const selectedLabels = collections.map((id: string) =>
        availableCollections.find(c => c.value === id)?.label || id
    )

    return (
        <div className="space-y-4">
            <PropertySection title="Content">
                <PropertyRow label="Placeholder">
                    <PropertyInput
                        value={placeholder || ""}
                        onChange={(v) => setProp((props: any) => props.placeholder = v)}
                    />
                </PropertyRow>

                <div className="space-y-2 mt-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Target Collections</label>

                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <button
                                role="combobox"
                                aria-expanded={openCombobox}
                                className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-background hover:bg-muted/50 transition-colors"
                            >
                                <span className="text-muted-foreground truncate">
                                    {collections.length > 0
                                        ? `${collections.length} selected`
                                        : "Select collections..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search collections..." />
                                <CommandList>
                                    <CommandEmpty>No collection found.</CommandEmpty>
                                    <CommandGroup>
                                        {availableCollections.map((collection) => (
                                            <CommandItem
                                                key={collection.value}
                                                value={collection.label}
                                                onSelect={() => toggleCollection(collection.value)}
                                            >
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    collections.includes(collection.value)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <Check className={cn("h-4 w-4")} />
                                                </div>
                                                {collection.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Selected Tags Display */}
                    {selectedLabels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {selectedLabels.map((label: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-[10px] px-1.5 py-0.5 font-normal flex items-center gap-1">
                                    {label}
                                    <button
                                        className="ml-0.5 hover:text-foreground text-muted-foreground"
                                        onClick={() => toggleCollection(collections[index])}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </PropertySection>

            <PropertySection title="Overlay Theme">
                <PropertyRow label="Theme">
                    <Select
                        value={overlayTheme || "minimal"}
                        onValueChange={(value) => setProp((props: any) => props.overlayTheme = value)}
                    >
                        <SelectTrigger className="w-full h-8 text-xs bg-transparent">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minimal">Default</SelectItem>
                        </SelectContent>
                    </Select>
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Style">
                <PropertyRow label="Background Color">
                    <PropertyColor
                        value={backgroundColor}
                        onChange={(color) => setProp((props: any) => props.backgroundColor = color)}
                    />
                </PropertyRow>
                <PropertyRow label="Text Color">
                    <PropertyColor
                        value={color}
                        onChange={(color) => setProp((props: any) => props.color = color)}
                    />
                </PropertyRow>
                <PropertyRow label="Padding">
                    <PropertySlider
                        value={padding || 12}
                        onChange={(v) => setProp((props: any) => props.padding = v)}
                        min={0}
                        max={40}
                        unit="px"
                    />
                </PropertyRow>
                <PropertyRow label="Border Radius">
                    <PropertySlider
                        value={borderRadius || 8}
                        onChange={(v) => setProp((props: any) => props.borderRadius = v)}
                        min={0}
                        max={50}
                        unit="px"
                    />
                </PropertyRow>
                <PropertyRow label="Width">
                    <PropertyInput
                        value={width || "100%"}
                        onChange={(v) => setProp((props: any) => props.width = v)}
                        placeholder="100% or 300px"
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

Search.craft = {
    displayName: "Search Block",
    props: {
        placeholder: "Search...",
        width: "100%",
        padding: 12,
        backgroundColor: "#ffffff",
        color: "#6b7280",
        borderRadius: 8,
        color: "#6b7280",
        borderRadius: 8,
        collections: [],
        overlayTheme: "minimal"
    },
    related: {
        settings: SearchSettings
    }
}
