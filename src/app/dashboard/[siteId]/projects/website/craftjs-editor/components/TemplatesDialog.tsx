"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { templates, Template } from "../data/templates"
import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
import { Plus, LayoutTemplate, Search } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface TemplatesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TemplatesDialog({ open, onOpenChange }: TemplatesDialogProps) {
    const { actions, query } = useEditor()
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [searchQuery, setSearchQuery] = useState("")

    const handleInsert = (template: Template) => {
        try {
            const nodeTree = query.parseReactElement(template.content).toNodeTree()
            actions.addNodeTree(nodeTree, "ROOT")
            onOpenChange(false)
        } catch (err) {
            console.error("Failed to insert template:", err)
        }
    }

    // derived state
    const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))]
    const filteredTemplates = templates.filter(t => {
        const matchesCategory = selectedCategory === "All" || t.category === selectedCategory
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1000px]! h-[80vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl overflow-hidden shadow-2xl border-none">
                <div className="flex h-full">
                    {/* Left Sidebar - Categories */}
                    <div className="w-64 border-r bg-muted/10 flex flex-col">
                        <div className="p-6 border-b shrink-0">
                            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                <LayoutTemplate className="w-5 h-5" />
                                Templates
                            </h2>
                        </div>
                        <ScrollArea className="flex-1 py-4">
                            <div className="px-3 space-y-1">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all",
                                            selectedCategory === category
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Content - Grid */}
                    <div className="flex-1 flex flex-col bg-background/50">
                        {/* Header / Search */}
                        <div className="p-6 border-b flex items-center gap-4 shrink-0 backdrop-blur-sm bg-background/50">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search layouts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background/50"
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {filteredTemplates.length} result{filteredTemplates.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Templates Grid */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        className="group relative flex flex-col rounded-xl overflow-hidden border bg-card hover:shadow-lg transition-all hover:border-primary/20"
                                    >
                                        {/* Visual Preview */}
                                        <div className="aspect-[4/3] bg-muted/20 flex flex-col items-center justify-center p-8 gap-4 border-b relative group-hover:bg-muted/30 transition-colors">
                                            <template.icon className="w-12 h-12 text-muted-foreground/30 group-hover:text-primary/80 transition-all duration-300 group-hover:scale-110" />

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center p-4">
                                                <Button
                                                    onClick={() => handleInsert(template)}
                                                    className="shadow-xl"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Insert Layout
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-card/50">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-sm">{template.name}</h3>
                                                <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded">
                                                    {template.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
