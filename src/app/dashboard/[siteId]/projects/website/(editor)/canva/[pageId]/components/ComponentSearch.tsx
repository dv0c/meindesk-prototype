"use client"

import { useEffect, useState } from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { templates, Template } from "../data/templates"
import { useEditor } from "@craftjs/core"
import { LayoutTemplate, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComponentSearchProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ComponentSearch({ open, onOpenChange }: ComponentSearchProps) {
    const { actions, query } = useEditor()
    const [selectedCollections, setSelectedCollections] = useState<string[]>(["All"])

    // Get unique categories
    const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))]

    // Toggle collection selection
    const toggleCollection = (category: string) => {
        if (category === "All") {
            setSelectedCollections(["All"])
            return
        }

        let newSelection = [...selectedCollections]
        if (newSelection.includes("All")) {
            newSelection = []
        }

        if (newSelection.includes(category)) {
            newSelection = newSelection.filter(c => c !== category)
        } else {
            newSelection.push(category)
        }

        if (newSelection.length === 0) {
            newSelection = ["All"]
        }

        setSelectedCollections(newSelection)
    }

    const filteredTemplates = templates.filter(t => {
        if (selectedCollections.includes("All")) return true
        return selectedCollections.includes(t.category)
    })

    const handleInsert = (template: Template) => {
        console.log("Inserting template:", template.name)
        try {
            const nodeTree = query.parseReactElement(template.content).toNodeTree()
            actions.addNodeTree(nodeTree, "ROOT")
            onOpenChange(false)
        } catch (err) {
            console.error("Failed to insert template:", err)
        }
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Search components..." />
            <CommandList className="max-h-[60vh]">
                <CommandEmpty>No results found.</CommandEmpty>

                {/* Collections Filter */}
                <CommandGroup heading="Collections">
                    <div className="flex flex-wrap gap-2 px-2 pb-2">
                        {categories.map(category => (
                            <div
                                key={category}
                                onClick={() => toggleCollection(category)}
                                className={cn(
                                    "px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors border",
                                    selectedCollections.includes(category)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent"
                                )}
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                </CommandGroup>

                <CommandSeparator />

                {/* Results */}
                <CommandGroup heading="Components">
                    {filteredTemplates.map((template) => (
                        <CommandItem
                            key={template.id}
                            onSelect={() => handleInsert(template)}
                            className="flex items-center gap-3 p-2 cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded border bg-muted/20 flex items-center justify-center shrink-0">
                                <template.icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{template.name}</span>
                                    <span className="text-[10px] uppercase text-muted-foreground bg-muted px-1.5 rounded">
                                        {template.category}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                            </div>
                            <CommandShortcut><Plus className="w-4 h-4" /></CommandShortcut>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
