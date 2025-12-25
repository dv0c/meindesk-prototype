"use client"

import { Frame, Element } from "@craftjs/core"
import { Container } from "../user-components"
import { Plus } from "lucide-react"

export function CraftCanvas() {
    return (
        <div className="canvas-interactive-area relative min-h-full transition-all duration-300 overflow-auto">
            <Frame>
                <Element
                    is={Container}
                    canvas
                    padding={20}
                    backgroundColor="transparent"
                    minHeight={400}
                    className="min-h-full"
                >
                    {/* Empty state is handled by Container rendering */}
                </Element>
            </Frame>
        </div>
    )
}

// Empty canvas placeholder (shown when frame is empty)
export function EmptyCanvasPlaceholder() {
    return (
        <div className="text-center space-y-4 max-w-sm mx-auto p-8 border-2 border-dashed rounded-xl transition-all duration-200 border-muted-foreground/20 bg-muted/5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-muted/10">
                <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
                <h3 className="font-semibold text-lg">Start Building</h3>
                <p className="text-sm text-muted-foreground">
                    Drag elements from the sidebar or click + to get started.
                </p>
            </div>
        </div>
    )
}
