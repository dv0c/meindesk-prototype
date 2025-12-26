"use client"

import { useEditor, Element } from "@craftjs/core"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search } from "lucide-react"
import { componentRegistry, componentDefinitions } from "../user-components"
import { useMarketplaceSafe } from "./MarketplaceContext"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"


export function CraftToolbox() {
    const { connectors } = useEditor()
    const [searchQuery, setSearchQuery] = useState("")
    const { isComponentAvailable, installedThemes, isLoading } = useMarketplaceSafe()

    // Filter components by search and availability
    const filteredComponents = componentDefinitions.filter((c) => {
        // First check if it matches search
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        // Then check if component is available (from installed themes)
        return isComponentAvailable(c.name)
    })

    const categories = Array.from(new Set(filteredComponents.map((c) => c.category)))

    // Get theme name for a component (for badge display)
    const getComponentTheme = (componentName: string): string | null => {
        for (const theme of installedThemes) {
            if (theme.name === "Core") continue
            const hasComponent = theme.blocks.some(b => b.componentName === componentName)
            if (hasComponent) return theme.name
        }
        return null
    }

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
                    {isLoading && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            Loading components...
                        </div>
                    )}

                    {!isLoading && categories.length === 0 && (
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
                                    .map((componentDef) => {
                                        // Find the full registration from the registry
                                        const registration = componentRegistry.find(
                                            (r) => r.name === componentDef.name
                                        )

                                        if (!registration) return null

                                        const Component = registration.component
                                        const themeName = getComponentTheme(componentDef.name)

                                        return (
                                            <div
                                                key={componentDef.name}
                                                ref={(ref) => {
                                                    if (ref) {
                                                        if (registration.isContainer) {
                                                            connectors.create(ref, <Element is={Component} canvas />)
                                                        } else {
                                                            connectors.create(ref, <Component />)
                                                        }
                                                    }
                                                }}
                                                className="flex flex-col items-center justify-center p-3 h-[80px] border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/50 cursor-grab transition-all duration-200 group relative"
                                            >
                                                {themeName && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
                                                    >
                                                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                                        {themeName.split(' ')[0]}
                                                    </Badge>
                                                )}
                                                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                                    {registration.icon}
                                                </div>
                                                <span className="text-xs font-medium mt-2 text-center leading-tight">
                                                    {componentDef.name}
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

