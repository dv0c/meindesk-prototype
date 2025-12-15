"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import type { ComponentDefinition } from "@/lib/types"
import { getAvailableComponents } from "@/lib/component-registry"
import { Loader2, Search } from "lucide-react"
import { DraggablePaletteItem } from "./draggable-palette-item"

interface ComponentPaletteProps {
  onAddComponent: (component: ComponentDefinition) => void
  siteId?: string
}

export function ComponentPalette({ onAddComponent, siteId }: ComponentPaletteProps) {
  const [components, setComponents] = useState<ComponentDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadComponents()
  }, [siteId])

  async function loadComponents() {
    setLoading(true)
    const data = await getAvailableComponents(siteId)
    setComponents(data)
    setLoading(false)
  }

  const filteredComponents = components.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = Array.from(new Set(filteredComponents.map((c) => c.category)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
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

      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-6">
          {categories.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No components found</div>
          )}

          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{category}</h4>
              <div className="grid grid-cols-2 gap-2">
                {filteredComponents
                  .filter((c) => c.category === category)
                  .map((component) => (
                    <DraggablePaletteItem
                      key={component.themeName ? `${component.themeName}_${component.name}` : component.name}
                      component={component}
                      onAdd={() => onAddComponent(component)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
