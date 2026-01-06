"use client"

import { useEditor } from "@craftjs/core"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, Plus, LayoutTemplate, X } from "lucide-react"
import { templates, Template } from "../data/templates"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface TemplatesPanelProps {
    onClose?: () => void
}

export function TemplatesPanel({ onClose }: TemplatesPanelProps) {
    const { actions, query } = useEditor()
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // Categories derived from templates
    const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))]

    // Filter templates
    const filteredTemplates = templates.filter(t => {
        const matchesCategory = selectedCategory === "All" || t.category === selectedCategory
        const matchesSearch =
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Insert template into canvas
    const handleInsert = (template: Template) => {
        try {
            const nodeTree = query.parseReactElement(template.content).toNodeTree()
            actions.addNodeTree(nodeTree, "ROOT")
        } catch (err) {
            console.error("Failed to insert template:", err)
        }
    }

    return (
        <div className="w-[320px] border-l bg-gradient-to-b from-background to-muted/20 flex flex-col h-full shadow-lg z-20 overflow-hidden">
            {/* Header - matches CraftToolbox style */}
            <div className="p-4 border-b space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                        Sections
                    </h4>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    )}
                </div>

                {/* Search - matches CraftToolbox */}
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sections..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                "px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
                                selectedCategory === category
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid - with proper scroll */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-3">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            <LayoutTemplate className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No sections found
                        </div>
                    ) : (
                        filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="group relative cursor-pointer"
                                onMouseEnter={() => setHoveredId(template.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => handleInsert(template)}
                            >
                                {/* Image Preview */}
                                <div className={cn(
                                    "relative rounded-lg overflow-hidden border bg-card transition-all duration-200",
                                    hoveredId === template.id
                                        ? "ring-2 ring-primary/50 border-primary/30"
                                        : "hover:border-muted-foreground/30"
                                )}>
                                    <Image
                                        src={template.previewImage}
                                        alt={template.name}
                                        width={290}
                                        height={180}
                                        className="w-full h-auto object-cover"
                                    />

                                    {/* Hover Overlay */}
                                    {hoveredId === template.id && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity">
                                            <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                                                <Plus className="w-4 h-4" />
                                                Add {template.name}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
