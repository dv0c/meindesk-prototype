"use client"

import * as React from "react"
import { useServerInsertedHTML } from "next/navigation"

const SYSTEM_THEME = "(prefers-color-scheme: dark)"

export interface ThemeProviderProps {
  children: React.ReactNode
  themes?: string[]
  forcedTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  defaultTheme?: string
  attribute?: "class" | `data-${string}` | ("class" | `data-${string}`)[]
  value?: Record<string, string>
  nonce?: string
}

interface ThemeContextValue {
  themes: string[]
  forcedTheme?: string
  theme?: string
  resolvedTheme?: string
  systemTheme?: "dark" | "light"
  setTheme: React.Dispatch<React.SetStateAction<string>>
}

const ThemeContext = React.createContext<ThemeContextValue>({
  themes: [],
  setTheme: () => {},
})

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia(SYSTEM_THEME).matches ? "dark" : "light"
}

function buildThemeScript({
  storageKey,
  defaultTheme,
  attribute,
  themes,
  enableSystem,
  forcedTheme,
  value,
}: {
  storageKey: string
  defaultTheme: string
  attribute: string
  themes: string[]
  enableSystem: boolean
  forcedTheme?: string
  value?: Record<string, string>
}) {
  const themeValues = value ? Object.values(value) : themes
  const serialized = JSON.stringify([
    attribute,
    storageKey,
    defaultTheme,
    forcedTheme ?? null,
    themes,
    value ?? null,
    enableSystem,
  ]).slice(1, -1)

  return `!(function(){try{var d=document.documentElement,p=[${serialized}];var attribute=p[0],storageKey=p[1],defaultTheme=p[2],forcedTheme=p[3],themes=p[4],value=p[5],enableSystem=p[6];var themeValues=value?Object.values(value):themes;function applyTheme(name){var resolved=name;if(!resolved)return;if(name==="system"&&enableSystem){resolved=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var next=value&&value[name]?value[name]:resolved;if(attribute==="class"){d.classList.remove.apply(d.classList,themeValues);if(next)d.classList.add(next);}else{d.setAttribute(attribute,next||"");}}applyTheme(forcedTheme||localStorage.getItem(storageKey)||defaultTheme);}catch(e){}})();`
}

function applyThemeToDocument(
  theme: string,
  {
    attribute,
    themes,
    value,
    enableSystem,
  }: {
    attribute: string
    themes: string[]
    value?: Record<string, string>
    enableSystem: boolean
  }
) {
  const themeValues = value ? Object.values(value) : themes
  let resolved = theme
  if (theme === "system" && enableSystem) {
    resolved = getSystemTheme()
  }
  const next = value?.[theme] ?? resolved
  const el = document.documentElement

  if (attribute === "class") {
    el.classList.remove(...themeValues)
    if (next) el.classList.add(next)
  } else {
    el.setAttribute(attribute, next)
  }

  if (["dark", "light"].includes(resolved)) {
    el.style.colorScheme = resolved
  }
}

export function ThemeProvider({
  children,
  themes = ["light", "dark"],
  forcedTheme,
  enableSystem = false,
  disableTransitionOnChange = false,
  enableColorScheme = true,
  storageKey = "theme",
  defaultTheme = enableSystem ? "system" : "light",
  attribute = "class",
  value,
  nonce,
}: ThemeProviderProps) {
  const inserted = React.useRef(false)
  const attributeName = Array.isArray(attribute) ? attribute[0] : attribute
  const availableThemes = enableSystem ? [...themes, "system"] : themes

  useServerInsertedHTML(() => {
    if (inserted.current) return null
    inserted.current = true

    return (
      <script
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: buildThemeScript({
            storageKey,
            defaultTheme,
            attribute: attributeName,
            themes,
            enableSystem,
            forcedTheme,
            value,
          }),
        }}
      />
    )
  })

  const [theme, setThemeState] = React.useState(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState<"dark" | "light">("light")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setThemeState(stored)
    } catch {
      // ignore
    }
    setSystemTheme(getSystemTheme())
  }, [storageKey])

  React.useEffect(() => {
    if (!enableSystem) return
    const media = window.matchMedia(SYSTEM_THEME)
    const onChange = () => {
      setSystemTheme(getSystemTheme())
      if (theme === "system" && !forcedTheme) {
        applyThemeToDocument("system", {
          attribute: attributeName,
          themes,
          value,
          enableSystem,
        })
      }
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [attributeName, enableSystem, forcedTheme, theme, themes, value])

  React.useEffect(() => {
    if (!mounted) return
    applyThemeToDocument(forcedTheme ?? theme, {
      attribute: attributeName,
      themes,
      value,
      enableSystem,
    })
  }, [attributeName, enableSystem, forcedTheme, mounted, theme, themes, value])

  const setTheme = React.useCallback(
    (next: React.SetStateAction<string>) => {
      setThemeState((current) => {
        const resolved = typeof next === "function" ? next(current) : next
        try {
          localStorage.setItem(storageKey, resolved)
        } catch {
          // ignore
        }

        if (disableTransitionOnChange) {
          const style = document.createElement("style")
          style.appendChild(
            document.createTextNode(
              "*,*::before,*::after{transition:none!important}"
            )
          )
          document.head.appendChild(style)
          applyThemeToDocument(forcedTheme ?? resolved, {
            attribute: attributeName,
            themes,
            value,
            enableSystem,
          })
          window.getComputedStyle(document.body)
          requestAnimationFrame(() => {
            document.head.removeChild(style)
          })
        } else {
          applyThemeToDocument(forcedTheme ?? resolved, {
            attribute: attributeName,
            themes,
            value,
            enableSystem,
          })
        }

        return resolved
      })
    },
    [
      attributeName,
      disableTransitionOnChange,
      enableSystem,
      forcedTheme,
      storageKey,
      themes,
      value,
    ]
  )

  const activeTheme = forcedTheme ?? theme
  const resolvedTheme =
    activeTheme === "system" && enableSystem
      ? systemTheme
      : activeTheme

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      themes: availableThemes,
      forcedTheme,
      theme: activeTheme,
      resolvedTheme,
      systemTheme: enableSystem ? systemTheme : undefined,
      setTheme,
    }),
    [activeTheme, availableThemes, enableSystem, forcedTheme, resolvedTheme, setTheme, systemTheme]
  )

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
