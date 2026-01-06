"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface HoverContextType {
    hoveredNodeId: string | null
    hoveredAncestors: string[]
    setHoveredNode: (nodeId: string | null, ancestors: string[]) => void
}

const HoverContext = createContext<HoverContextType>({
    hoveredNodeId: null,
    hoveredAncestors: [],
    setHoveredNode: () => { },
})

export function HoverProvider({ children }: { children: ReactNode }) {
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
    const [hoveredAncestors, setHoveredAncestors] = useState<string[]>([])

    const setHoveredNode = useCallback((nodeId: string | null, ancestors: string[]) => {
        setHoveredNodeId(nodeId)
        setHoveredAncestors(ancestors)
    }, [])

    return (
        <HoverContext.Provider value={{ hoveredNodeId, hoveredAncestors, setHoveredNode }}>
            {children}
        </HoverContext.Provider>
    )
}

export function useHoverContext() {
    return useContext(HoverContext)
}
