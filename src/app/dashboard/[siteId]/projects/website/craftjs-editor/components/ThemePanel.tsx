"use client"

import { useEditorTheme } from "./ThemeContext"
import {
    PropertySection,
    PropertyRow,
    PropertyColor,
    PropertyIconButtonGroup,
} from "./PropertySection"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemePanel() {
    const { theme, updateTheme, resetTheme } = useEditorTheme()

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Theme Settings</h3>
                <button
                    onClick={resetTheme}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Reset
                </button>
            </div>

            <PropertySection title="Mode" summary={theme.mode}>
                <PropertyRow label="Appearance">
                    <PropertyIconButtonGroup
                        value={theme.mode}
                        onChange={(v) => updateTheme({ mode: v as "light" | "dark" | "system" })}
                        options={[
                            { label: "Light", value: "light", icon: Sun },
                            { label: "Dark", value: "dark", icon: Moon },
                            { label: "System", value: "system", icon: Monitor },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Colors" summary="">
                <PropertyRow label="Primary">
                    <PropertyColor
                        value={theme.primaryColor}
                        onChange={(v) => updateTheme({ primaryColor: v })}
                    />
                </PropertyRow>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={theme.backgroundColor}
                        onChange={(v) => updateTheme({ backgroundColor: v })}
                    />
                </PropertyRow>
                <PropertyRow label="Text">
                    <PropertyColor
                        value={theme.textColor}
                        onChange={(v) => updateTheme({ textColor: v })}
                    />
                </PropertyRow>
                <PropertyRow label="Accent">
                    <PropertyColor
                        value={theme.accentColor}
                        onChange={(v) => updateTheme({ accentColor: v })}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}
