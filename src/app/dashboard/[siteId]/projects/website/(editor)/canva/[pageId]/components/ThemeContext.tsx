"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"

// Theme state structure
export interface EditorTheme {
    mode: "light" | "dark" | "system"
    primaryColor: string
    backgroundColor: string
    textColor: string
    accentColor: string
}

// Default theme values
const defaultTheme: EditorTheme = {
    mode: "light",
    primaryColor: "#3b82f6", // Blue
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#8b5cf6", // Purple
}

// Context type
interface EditorThemeContextType {
    theme: EditorTheme
    updateTheme: (updates: Partial<EditorTheme>) => void
    resetTheme: () => void
    getCssVariables: () => string
}

const EditorThemeContext = createContext<EditorThemeContextType | null>(null)

// Hook to use theme
export function useEditorTheme() {
    const context = useContext(EditorThemeContext)
    if (!context) {
        throw new Error("useEditorTheme must be used within an EditorThemeProvider")
    }
    return context
}

// Provider component
interface EditorThemeProviderProps {
    children: React.ReactNode
    initialTheme?: Partial<EditorTheme>
}

export function EditorThemeProvider({ children, initialTheme }: EditorThemeProviderProps) {
    const [theme, setTheme] = useState<EditorTheme>({
        ...defaultTheme,
        ...initialTheme,
    })

    const updateTheme = useCallback((updates: Partial<EditorTheme>) => {
        setTheme((prev) => ({ ...prev, ...updates }))
    }, [])

    const resetTheme = useCallback(() => {
        setTheme(defaultTheme)
    }, [])

    // Generate CSS variables string for injection
    const getCssVariables = useCallback(() => {
        const isDark = theme.mode === "dark"

        return `
            --theme-primary: ${theme.primaryColor};
            --theme-background: ${isDark ? "#0f172a" : theme.backgroundColor};
            --theme-foreground: ${isDark ? "#f8fafc" : theme.textColor};
            --theme-accent: ${theme.accentColor};
            --theme-card: ${isDark ? "#1e293b" : "#ffffff"};
            --theme-card-foreground: ${isDark ? "#f8fafc" : theme.textColor};
            --theme-muted: ${isDark ? "#334155" : "#f1f5f9"};
            --theme-muted-foreground: ${isDark ? "#94a3b8" : "#64748b"};
            --theme-border: ${isDark ? "#334155" : "#e2e8f0"};
        `
    }, [theme])

    const value = useMemo(
        () => ({
            theme,
            updateTheme,
            resetTheme,
            getCssVariables,
        }),
        [theme, updateTheme, resetTheme, getCssVariables]
    )

    return (
        <EditorThemeContext.Provider value={value}>
            {children}
        </EditorThemeContext.Provider>
    )
}
