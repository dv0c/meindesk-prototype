"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"

export interface DesignSettings {
    // Colors
    background: string
    neutral: string
    primary: string
    secondary: string
    tertiary: string

    // Fonts
    baseFont: string
    headingFont: string
    headingWeight: string

    // Buttons
    buttonShape: "rounded" | "pill" | "soft" | "square"
    buttonStyle: "filled" | "outline" | "ghost"
    buttonSize: "sm" | "md" | "lg"
    buttonBorder: "0" | "1" | "2"

    // Forms
    formShape: "rounded" | "pill" | "soft" | "square"
    formStyle: "fill" | "outline"

    // Theme selection
    selectedTheme: string | null
    selectedPalette: string | null
}

const defaultSettings: DesignSettings = {
    background: "#ffffff",
    neutral: "#1a1b20",
    primary: "#3a69f3",
    secondary: "#f0f0f2",
    tertiary: "#f7f8f8",
    baseFont: "Inter",
    headingFont: "Inter",
    headingWeight: "Medium",
    buttonShape: "rounded",
    buttonStyle: "filled",
    buttonSize: "md",
    buttonBorder: "0",
    formShape: "soft",
    formStyle: "outline",
    selectedTheme: "default",
    selectedPalette: "default",
}

interface DesignContextType {
    settings: DesignSettings
    updateSettings: (updates: Partial<DesignSettings>) => void
    resetSettings: () => void
    getCssVariables: () => string
}

const DesignContext = createContext<DesignContextType | null>(null)

// Default context for when not inside DesignProvider (e.g., CraftJS resolver)
const defaultContextValue: DesignContextType = {
    settings: { ...defaultSettings },
    updateSettings: () => { },
    resetSettings: () => { },
    getCssVariables: () => "",
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

    const updateSettings = useCallback((updates: Partial<DesignSettings>) => {
        setSettings((prev) => ({ ...prev, ...updates }))
    }, [])

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings)
    }, [])

    // Generate CSS variables for injection into canvas
    const getCssVariables = useCallback(() => {
        const borderRadius = settings.buttonShape === "square" ? "0px"
            : settings.buttonShape === "soft" ? "8px"
                : "9999px"

        return `
            --primary: ${settings.primary};
            --primary-foreground: #ffffff;
            --background: ${settings.background};
            --foreground: ${settings.neutral};
            --muted: ${settings.secondary};
            --muted-foreground: ${settings.neutral}aa;
            --border: ${settings.secondary};
            
            --font-sans: ${settings.baseFont}, sans-serif;
            --font-serif: ${settings.headingFont}, serif;

            --design-primary: ${settings.primary};
            --design-secondary: ${settings.secondary};
            --design-background: ${settings.background};
            --design-neutral: ${settings.neutral};
            --design-tertiary: ${settings.tertiary};
            --design-font-base: ${settings.baseFont}, sans-serif;
            --design-font-heading: ${settings.headingFont}, sans-serif;
            --design-font-weight-heading: ${settings.headingWeight === "Bold" ? "700" : settings.headingWeight === "SemiBold" ? "600" : settings.headingWeight === "Medium" ? "500" : "400"};
            --design-button-radius: ${borderRadius};
            --design-button-style: ${settings.buttonStyle};
        `
    }, [settings])

    const value = useMemo(
        () => ({
            settings,
            updateSettings,
            resetSettings,
            getCssVariables,
        }),
        [settings, updateSettings, resetSettings, getCssVariables]
    )

    return (
        <DesignContext.Provider value={value}>
            {children}
        </DesignContext.Provider>
    )
}
