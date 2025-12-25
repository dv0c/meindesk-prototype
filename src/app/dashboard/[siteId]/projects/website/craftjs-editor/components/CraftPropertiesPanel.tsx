"use client"

import { useEditor } from "@craftjs/core"

export function CraftPropertiesPanel() {
    const { selected, node } = useEditor((state) => {
        const currentNodeId = state.events.selected?.values().next().value
        let selectedNode = null

        if (currentNodeId) {
            selectedNode = {
                id: currentNodeId,
                name: state.nodes[currentNodeId]?.data.displayName || state.nodes[currentNodeId]?.data.name,
                settings: state.nodes[currentNodeId]?.related?.settings,
                isDeletable: state.nodes[currentNodeId]?.data.custom?.isDeletable !== false,
            }
        }

        return {
            selected: currentNodeId,
            node: selectedNode,
        }
    })

    if (!selected || !node) {
        return (
            <div className="p-4 text-center text-muted-foreground text-sm">
                Select a component to edit its properties
            </div>
        )
    }

    const SettingsComponent = node.settings

    return (
        <div className="p-4 space-y-4">
            {/* Component Name Header */}
            <div className="pb-3 border-b">
                <h4 className="font-medium text-sm">{node.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">Component Properties</p>
            </div>

            {/* Render Settings Component */}
            {SettingsComponent ? (
                <SettingsComponent />
            ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                    No editable properties available
                </div>
            )}


        </div>
    )
}


