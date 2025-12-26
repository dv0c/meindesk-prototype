"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"

export interface SEOSettings {
    title: string
    description: string
    ogImage: string
    favicon: string
    keywords: string
    preventIndexing: boolean
}

const defaultSEOSettings: SEOSettings = {
    title: "",
    description: "",
    ogImage: "",
    favicon: "",
    keywords: "",
    preventIndexing: false,
}

interface SEOContextType {
    seoSettings: SEOSettings
    updateSEOSettings: (updates: Partial<SEOSettings>) => void
    resetSEOSettings: () => void
    saveSEO: () => Promise<void>
    registerSEOSaveHandler: (handler: () => Promise<void>) => void
    isSavingSEO: boolean
}

const SEOContext = createContext<SEOContextType | null>(null)

export function useSEO() {
    const context = useContext(SEOContext)
    if (!context) {
        // Return defaults if used outside provider
        return {
            seoSettings: defaultSEOSettings,
            updateSEOSettings: () => { },
            resetSEOSettings: () => { },
            saveSEO: async () => { },
            registerSEOSaveHandler: () => { },
            isSavingSEO: false,
        }
    }
    return context
}

interface SEOProviderProps {
    children: React.ReactNode
    initialSettings?: Partial<SEOSettings>
}

export function SEOProvider({ children, initialSettings }: SEOProviderProps) {
    const [seoSettings, setSEOSettings] = useState<SEOSettings>({
        ...defaultSEOSettings,
        ...initialSettings,
    })
    const [isSavingSEO, setIsSavingSEO] = useState(false)
    const saveHandlerRef = React.useRef<(() => Promise<void>) | null>(null)

    const updateSEOSettings = useCallback((updates: Partial<SEOSettings>) => {
        setSEOSettings((prev) => ({ ...prev, ...updates }))
    }, [])

    const resetSEOSettings = useCallback(() => {
        setSEOSettings(defaultSEOSettings)
    }, [])

    const registerSEOSaveHandler = useCallback((handler: () => Promise<void>) => {
        saveHandlerRef.current = handler
    }, [])

    const saveSEO = useCallback(async () => {
        if (saveHandlerRef.current) {
            setIsSavingSEO(true)
            try {
                await saveHandlerRef.current()
            } finally {
                setIsSavingSEO(false)
            }
        }
    }, [])

    const value = useMemo(
        () => ({
            seoSettings,
            updateSEOSettings,
            resetSEOSettings,
            saveSEO,
            registerSEOSaveHandler,
            isSavingSEO,
        }),
        [seoSettings, updateSEOSettings, resetSEOSettings, saveSEO, registerSEOSaveHandler, isSavingSEO]
    )

    return (
        <SEOContext.Provider value={value}>
            {children}
        </SEOContext.Provider>
    )
}
