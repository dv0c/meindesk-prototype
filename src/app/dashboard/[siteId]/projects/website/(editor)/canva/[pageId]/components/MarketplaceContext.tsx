"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"

// Theme block definition from database
interface ThemeBlock {
    id: string
    componentName: string
    componentDefinition: {
        category: string
        description: string
        isCore: boolean
    }
}

// Theme from database
interface InstalledTheme {
    id: string
    name: string
    description: string
    thumbnail: string | null
    price: number
    isPremium: boolean
    blocks: ThemeBlock[]
}

interface MarketplaceContextType {
    installedThemes: InstalledTheme[]
    availableComponents: string[]
    isLoading: boolean
    error: string | null
    installTheme: (themeId: string) => Promise<void>
    uninstallTheme: (themeId: string) => Promise<void>
    isComponentAvailable: (componentName: string) => boolean
    refetch: () => Promise<void>
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null)

export function useMarketplace() {
    const context = useContext(MarketplaceContext)
    if (!context) {
        throw new Error("useMarketplace must be used within a MarketplaceProvider")
    }
    return context
}

// Safe version that returns defaults when outside provider
export function useMarketplaceSafe(): MarketplaceContextType {
    const context = useContext(MarketplaceContext)
    if (!context) {
        return {
            installedThemes: [],
            availableComponents: [],
            isLoading: false,
            error: null,
            installTheme: async () => { },
            uninstallTheme: async () => { },
            isComponentAvailable: () => true, // Default to allowing all components
            refetch: async () => { },
        }
    }
    return context
}

interface MarketplaceProviderProps {
    children: React.ReactNode
}

export function MarketplaceProvider({ children }: MarketplaceProviderProps) {
    const params = useParams()
    const siteId = params?.siteId as string

    const [installedThemes, setInstalledThemes] = useState<InstalledTheme[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Compute available components from installed themes
    const availableComponents = React.useMemo(() => {
        const components = new Set<string>()
        for (const theme of installedThemes) {
            for (const block of theme.blocks) {
                components.add(block.componentName)
            }
        }
        return Array.from(components)
    }, [installedThemes])

    // Fetch installed themes
    const fetchInstalledThemes = useCallback(async () => {
        if (!siteId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/sites/${siteId}/themes`)
            if (!response.ok) {
                throw new Error("Failed to fetch installed themes")
            }
            const themes = await response.json()
            setInstalledThemes(themes)
        } catch (err) {
            console.error("Error fetching themes:", err)
            setError(err instanceof Error ? err.message : "Failed to fetch themes")
        } finally {
            setIsLoading(false)
        }
    }, [siteId])

    // Initial fetch
    useEffect(() => {
        fetchInstalledThemes()
    }, [fetchInstalledThemes])

    // Install a theme
    const installTheme = useCallback(async (themeId: string) => {
        if (!siteId) return

        try {
            const response = await fetch(`/api/sites/${siteId}/themes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeId }),
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || "Failed to install theme")
            }

            // Refetch to get updated list
            await fetchInstalledThemes()
        } catch (err) {
            console.error("Error installing theme:", err)
            throw err
        }
    }, [siteId, fetchInstalledThemes])

    // Uninstall a theme
    const uninstallTheme = useCallback(async (themeId: string) => {
        if (!siteId) return

        try {
            const response = await fetch(`/api/sites/${siteId}/themes?themeId=${themeId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || "Failed to uninstall theme")
            }

            // Refetch to get updated list
            await fetchInstalledThemes()
        } catch (err) {
            console.error("Error uninstalling theme:", err)
            throw err
        }
    }, [siteId, fetchInstalledThemes])

    // Check if a component is available (from installed themes)
    const isComponentAvailable = useCallback((componentName: string) => {
        // If no themes are loaded yet, show nothing (prevents showing unavailable components)
        if (isLoading) {
            return false
        }

        // Component must be in an installed theme to be available
        return availableComponents.includes(componentName)
    }, [availableComponents, isLoading])

    const value: MarketplaceContextType = {
        installedThemes,
        availableComponents,
        isLoading,
        error,
        installTheme,
        uninstallTheme,
        isComponentAvailable,
        refetch: fetchInstalledThemes,
    }

    return (
        <MarketplaceContext.Provider value={value}>
            {children}
        </MarketplaceContext.Provider>
    )
}
