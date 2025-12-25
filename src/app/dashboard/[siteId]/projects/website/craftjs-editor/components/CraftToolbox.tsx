"use client"

import { useEditor, Element } from "@craftjs/core"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, Box, Type, Heading as HeadingIcon, Image as ImageIcon, LayoutGrid, Minus, Square } from "lucide-react"
import {
    Container,
    Heading,
    Text,
    Button,
    Image,
    Grid,
    Divider,
    Spacer,
    componentDefinitions,
} from "../user-components"

const iconMap: Record<string, React.ReactNode> = {
    Container: <Box className="h-5 w-5" />,
    Grid: <LayoutGrid className="h-5 w-5" />,
    Heading: <HeadingIcon className="h-5 w-5" />,
    Text: <Type className="h-5 w-5" />,
    Button: <Square className="h-5 w-5" />,
    Image: <ImageIcon className="h-5 w-5" />,
    Divider: <Minus className="h-5 w-5" />,
    Spacer: <Box className="h-5 w-5" />,
}

const componentMap: Record<string, React.ComponentType<any>> = {
    Container,
    Heading,
    Text,
    Button,
    Image,
    Grid,
    Divider,
    Spacer,
}

export function CraftToolbox() {
    const { connectors } = useEditor()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredComponents = componentDefinitions.filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const categories = Array.from(new Set(filteredComponents.map((c) => c.category)))

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Widget..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-6">
                    {categories.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            No components found
                        </div>
                    )}

                    {categories.map((category) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                {category}
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {filteredComponents
                                    .filter((c) => c.category === category)
                                    .map((component) => {
                                        const Component = componentMap[component.name]
                                        // Determine if this component accepts children
                                        const isContainer = component.name === "Container" || component.name === "Grid"

                                        return (
                                            <div
                                                key={component.name}
                                                ref={(ref) => {
                                                    if (ref) {
                                                        if (isContainer) {
                                                            connectors.create(ref, <Element is={Component} canvas />)
                                                        } else {
                                                            connectors.create(ref, <Component />)
                                                        }
                                                    }
                                                }}
                                                className="flex flex-col items-center justify-center p-3 h-[80px] border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/50 cursor-grab transition-all duration-200 group"
                                            >
                                                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                                    {iconMap[component.name] || <Box className="h-5 w-5" />}
                                                </div>
                                                <span className="text-xs font-medium mt-2 text-center leading-tight">
                                                    {component.name}
                                                </span>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
