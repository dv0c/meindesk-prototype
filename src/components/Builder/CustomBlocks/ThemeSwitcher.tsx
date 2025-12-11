"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

interface ThemeSwitcherProps {
    variant?: "button" | "toggle" | "icon"
    size?: "sm" | "md" | "lg"
    showLabel?: boolean
    lightLabel?: string
    darkLabel?: string
    position?: "inline" | "fixed-top-right" | "fixed-bottom-right"
    className?: string
}

export default function ThemeSwitcher({
    variant = "icon",
    size = "md",
    showLabel = true,
    lightLabel = "Light",
    darkLabel = "Dark",
    position = "inline",
    className = "",
}: ThemeSwitcherProps) {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Check localStorage or system preference
        const stored = localStorage.getItem("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

        const initialDark = stored === "dark" || (!stored && prefersDark)
        setIsDark(initialDark)
        applyTheme(initialDark)
    }, [])

    const applyTheme = (dark: boolean) => {
        if (dark) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }

    const toggleTheme = () => {
        const newDark = !isDark
        setIsDark(newDark)
        localStorage.setItem("theme", newDark ? "dark" : "light")
        applyTheme(newDark)
    }

    const sizeClasses = {
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
    }

    const positionClasses = {
        inline: "",
        "fixed-top-right": "fixed top-4 right-4 z-50",
        "fixed-bottom-right": "fixed bottom-4 right-4 z-50",
    }

    // Button variant
    if (variant === "button") {
        return (
            <div className={`${positionClasses[position]} ${className}`}>
                <Button
                    onClick={toggleTheme}
                    variant={isDark ? "default" : "outline"}
                    size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
                    className={`gap-2 ${sizeClasses[size]}`}
                >
                    {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {showLabel && (isDark ? darkLabel : lightLabel)}
                </Button>
            </div>
        )
    }

    // Icon-only variant
    if (variant === "icon") {
        return (
            <div className={`${positionClasses[position]} ${className}`}>
                <Button
                    onClick={toggleTheme}
                    variant="ghost"
                    size="icon"
                    className={sizeClasses[size]}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
            </div>
        )
    }

    // Toggle variant
    return (
        <div className={`flex items-center gap-2 ${positionClasses[position]} ${className}`}>
            <Sun className="h-4 w-4" />
            {showLabel && <Label className="text-sm">{lightLabel}</Label>}
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
            {showLabel && <Label className="text-sm">{darkLabel}</Label>}
            <Moon className="h-4 w-4" />
        </div>
    )
}
