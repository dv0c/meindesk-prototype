"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"

import { DesignSettings, defaultSettings, getDesignCssVariables } from "@/lib/design-system"

// Re-export for compatibility if needed, but prefer importing from lib
export type { DesignSettings }

interface DesignContextType {
    settings: DesignSettings
    updateSettings: (updates: Partial<DesignSettings>) => void
    resetSettings: () => void
    saveDesign: () => Promise<void>
    registerSaveHandler: (handler: () => Promise<void>) => void
    isSaving: boolean
}

const DesignContext = createContext<DesignContextType | null>(null)

// Default context for when not inside DesignProvider (e.g., CraftJS resolver)
const defaultContextValue: DesignContextType = {
    settings: { ...defaultSettings },
    updateSettings: () => { },
    resetSettings: () => { },
    getCssVariables: () => "",
    saveDesign: async () => { },
    registerSaveHandler: () => { },
    isSaving: false,
}

export function useDesign() {
    const context = useContext(DesignContext)
    // Return default values when outside provider (e.g., during CraftJS resolver registration)
    if (!context) {
        return defaultContextValue
    }
    return context
}

interface DesignProviderProps {
    children: React.ReactNode
    initialSettings?: Partial<DesignSettings>
}

export function DesignProvider({ children, initialSettings }: DesignProviderProps) {
    const [settings, setSettings] = useState<DesignSettings>({
        ...defaultSettings,
        ...initialSettings,
    })
    const [isSaving, setIsSaving] = useState(false)
    const saveHandlerRef = React.useRef<(() => Promise<void>) | null>(null)

    const updateSettings = useCallback((updates: Partial<DesignSettings>) => {
        setSettings((prev) => ({ ...prev, ...updates }))
    }, [])

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings)
    }, [])

    const registerSaveHandler = useCallback((handler: () => Promise<void>) => {
        saveHandlerRef.current = handler
    }, [])

    const saveDesign = useCallback(async () => {
        if (saveHandlerRef.current) {
            setIsSaving(true)
            try {
                await saveHandlerRef.current()
            } finally {
                setIsSaving(false)
            }
        } else {
            console.warn("No save handler registered (DesignContext)")
        }
    }, [])

    // Generate CSS variables for injection into canvas
    const getCssVariables = useCallback(() => {
        return getDesignCssVariables(settings)
    }, [settings])

    const value = useMemo(
        () => ({
            settings,
            updateSettings,
            resetSettings,
            getCssVariables,
            saveDesign,
            registerSaveHandler,
            isSaving,
        }),
        [settings, updateSettings, resetSettings, getCssVariables, saveDesign, registerSaveHandler, isSaving]
    )

    return (
        <DesignContext.Provider value={value}>
            {children}
        </DesignContext.Provider>
    )
}
