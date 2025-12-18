"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { LayoutNode } from "@/lib/types"

interface Snippet {
    id: string
    name: string
    description?: string
    category: string
    thumbnail?: string
    content: LayoutNode[]
    createdAt: string
    updatedAt: string
}

interface SnippetsContextType {
    snippets: Snippet[]
    loading: boolean
    fetchSnippets: () => Promise<void>
    getSnippet: (id: string) => Snippet | undefined
    refreshSnippets: () => Promise<void>
}

const SnippetsContext = createContext<SnippetsContextType | null>(null)

export function useSnippets() {
    const context = useContext(SnippetsContext)
    if (!context) {
        throw new Error("useSnippets must be used within a SnippetsProvider")
    }
    return context
}

interface SnippetsProviderProps {
    siteId: string
    children: React.ReactNode
}

export function SnippetsProvider({ siteId, children }: SnippetsProviderProps) {
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const [loading, setLoading] = useState(false)

    const fetchSnippets = useCallback(async () => {
        if (!siteId) return

        setLoading(true)
        try {
            const response = await fetch(`/api/v1/${siteId}/snippets`)
            if (response.ok) {
                const data = await response.json()
                setSnippets(data)
            }
        } catch (error) {
            console.error("Failed to fetch snippets:", error)
        } finally {
            setLoading(false)
        }
    }, [siteId])

    const getSnippet = useCallback((id: string) => {
        return snippets.find(s => s.id === id)
    }, [snippets])

    const refreshSnippets = useCallback(async () => {
        await fetchSnippets()
    }, [fetchSnippets])

    // Auto-fetch snippets on mount
    useEffect(() => {
        fetchSnippets()
    }, [fetchSnippets])

    // Listen for snippet refresh events
    useEffect(() => {
        const handleRefresh = () => {
            refreshSnippets()
        }

        window.addEventListener('snippets-refresh', handleRefresh)
        return () => window.removeEventListener('snippets-refresh', handleRefresh)
    }, [refreshSnippets])

    return (
        <SnippetsContext.Provider value={{ snippets, loading, fetchSnippets, getSnippet, refreshSnippets }}>
            {children}
        </SnippetsContext.Provider>
    )
}
