"use client"

import { useNode } from "@craftjs/core"
import { AlertTriangle } from "lucide-react"

interface MissingComponentProps {
    componentName?: string
    [key: string]: any
}

/**
 * Placeholder component displayed when a component type is not found
 * (e.g., when a theme is uninstalled but pages still contain its components)
 */
export function MissingComponent({ componentName, ...props }: MissingComponentProps) {
    const { connectors: { connect, drag }, isSelected } = useNode((node) => ({
        isSelected: node.events.selected,
    }))

    return (
        <div
            ref={(ref) => ref && connect(drag(ref))}
            className={`
                flex flex-col items-center justify-center gap-3 p-6 
                border-2 border-dashed rounded-lg transition-all
                ${isSelected
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                    : "border-orange-300 bg-orange-50/50 dark:bg-orange-950/20"
                }
            `}
        >
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold text-sm">Missing Component</span>
            </div>
            <p className="text-xs text-center text-orange-600/80 dark:text-orange-300/80 max-w-xs">
                {componentName ? (
                    <>
                        The component <span className="font-mono font-bold">{componentName}</span> is not installed.
                        <br />
                        Install the required theme or remove this block.
                    </>
                ) : (
                    "This component is not available. The theme may have been uninstalled."
                )}
            </p>
        </div>
    )
}

// CraftJS configuration
MissingComponent.craft = {
    displayName: "Missing Component",
    props: {
        componentName: undefined,
    },
    related: {},
    rules: {
        canDrag: () => true,
    },
}
