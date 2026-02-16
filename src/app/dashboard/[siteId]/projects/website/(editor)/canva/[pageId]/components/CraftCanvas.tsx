"use client"

import { Frame, Element } from "@craftjs/core"
import { Container } from "../user-components"
import { Plus } from "lucide-react"

export function CraftCanvas() {
    return (
        <div
            className="canvas-interactive-area h-full relative min-h-full transition-all duration-300 overflow-auto"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)",
                backgroundSize: "20px 20px",
            }}
        >
            <Frame>
                <Element
                    is={Container}
                    canvas
                    style={{
                        paddingTop: 20,
                        paddingRight: 20,
                        paddingBottom: 20,
                        paddingLeft: 20,
                        width: "100%",
                        height: "100%",
                        minHeight: "804px",
                        backgroundColor: "transparent",
                    }}
                    custom={{ displayName: "App", isDeletable: false, isApp: true }}
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
                    1) Open Build on the left 2) Drag a block here 3) Click the block to edit it.
                </p>
            </div>
        </div>
    )
}
