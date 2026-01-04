'use client'

import * as React from 'react'
import {
    ThemeProvider as NextThemesProvider,
    type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider defaultTheme="system" enableSystem themes={['light', 'dark', 'modern', 'cyberpunk', 'system']} {...props}>{children}</NextThemesProvider>
}