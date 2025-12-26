"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { componentRegistry } from "../../craftjs-editor/user-components/registry"

export default function AdminMarketplacePage() {
    const [selected, setSelected] = useState<Set<string>>(
        new Set(componentRegistry.filter(c => c.isCore).map(c => c.name))
    )

    const toggleComponent = (name: string, isCore: boolean) => {
        if (isCore) return // Core components cannot be toggled

        const newSelected = new Set(selected)
        if (newSelected.has(name)) {
            newSelected.delete(name)
        } else {
            newSelected.add(name)
        }
        setSelected(newSelected)
    }

    // Group components by category
    const groupedComponents = useMemo(() => {
        return componentRegistry.reduce((acc, comp) => {
            const category = comp.category.toUpperCase()
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push(comp)
            return acc
        }, {} as Record<string, typeof componentRegistry>)
    }, [])

    const categories = Object.keys(groupedComponents).sort()

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Components</h1>
                <p className="text-muted-foreground">
                    {selected.size} selected
                </p>
            </div>

            <div className="space-y-8">
                {categories.map((category) => (
                    <div key={category}>
                        <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-4">
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedComponents[category].map((component) => {
                                const isSelected = selected.has(component.name)
                                const isCore = component.isCore || false

                                return (
                                    <Card
                                        key={component.name}
                                        className={`cursor-pointer transition-all ${isSelected ? "border-primary" : ""
                                            }`}
                                        onClick={() => toggleComponent(component.name, isCore)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        disabled={isCore}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleComponent(component.name, isCore)
                                                        }}
                                                    />
                                                    <CardTitle className="text-base">{component.name}</CardTitle>
                                                </div>
                                                {isCore && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Core
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="text-sm">
                                                {component.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {componentRegistry.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No components available</p>
                </div>
            )}
        </div>
    )
}
