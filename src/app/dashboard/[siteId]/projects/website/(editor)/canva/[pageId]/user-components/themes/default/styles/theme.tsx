"use client"

import React from "react"
import { Colors } from "./colors"
import { Typography } from "./typography"

export const DefaultThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="default-theme-provider font-sans text-foreground antialiased"
            style={{
                // Colors
                '--theme-primary': Colors.primary,
                '--theme-secondary': Colors.secondary,
                '--theme-background': Colors.background,
                '--theme-surface': Colors.surface,
                '--theme-text': Colors.text,
                '--theme-muted': Colors.muted,
                '--theme-accent': Colors.accent,
                '--theme-border': Colors.border,

                // Typography
                '--font-heading': Typography.fontFamily.heading,
                '--font-body': Typography.fontFamily.body,

                // Base
                color: 'var(--theme-text)',
                backgroundColor: 'var(--theme-background)',
            } as React.CSSProperties}
        >
            <style jsx global>{`
                .default-theme-provider h1, 
                .default-theme-provider h2, 
                .default-theme-provider h3, 
                .default-theme-provider h4, 
                .default-theme-provider h5, 
                .default-theme-provider h6 {
                    font-family: var(--font-heading);
                    line-height: ${Typography.lineHeight.heading};
                    font-weight: 700;
                    margin-bottom: 1rem;
                }
                .default-theme-provider p {
                    line-height: ${Typography.lineHeight.body};
                    margin-bottom: 1.5rem;
                }
            `}</style>
            {children}
        </div>
    )
}
