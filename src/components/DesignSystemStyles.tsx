"use client"

import { useEffect, useMemo } from "react"
import { DesignSettings, getDesignCssVariables, getFontUrls, defaultSettings } from "@/lib/design-system"

interface DesignSystemStylesProps {
    settings?: DesignSettings
}

export function DesignSystemStyles({ settings = defaultSettings }: DesignSystemStylesProps) {
    // Generate CSS variables string
    const cssVariables = useMemo(() => {
        return getDesignCssVariables(settings)
    }, [settings])

    // Generate Font URLs
    const fontUrls = useMemo(() => {
        return getFontUrls(settings)
    }, [settings])

    return (
        <>
            {/* Font Links */}
            {fontUrls.google && (
                <link rel="stylesheet" href={fontUrls.google} />
            )}
            {fontUrls.fontshare && (
                <link rel="stylesheet" href={fontUrls.fontshare} />
            )}

            {/* CSS Variables Injection */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    ${cssVariables}
                }
            `}} />
        </>
    )
}
