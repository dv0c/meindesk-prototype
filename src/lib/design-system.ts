
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

export const defaultSettings: DesignSettings = {
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

export const getDesignCssVariables = (settings: DesignSettings) => {
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
}

export interface FontPairing {
    id: string
    heading: string
    body: string
    type?: "google" | "fontshare" // Default to google if undefined
}

export const fontPairings: FontPairing[] = [
    // --- Sans-serif Pairings ---
    { id: "inter", heading: "Inter", body: "Inter" }, // Google
    { id: "poppins-inter", heading: "Poppins", body: "Inter" }, // Google
    { id: "clash-display", heading: "Clash Display", body: "Clash Grotesk", type: "fontshare" },
    { id: "plein-switzer", heading: "Plein", body: "Switzer", type: "fontshare" },
    { id: "bricolage-manrope", heading: "Bricolage Grotesque", body: "Manrope" }, // Google
    { id: "syne-space", heading: "Syne", body: "Space Grotesk" }, // Google
    { id: "pilcrow-archivo", heading: "Pilcrow Rounded", body: "Archivo", type: "fontshare" },
    { id: "outfit-switzer", heading: "Outfit", body: "Switzer", type: "fontshare" }, // Outfit is Google, Switzer is Fontshare - mixed need handling
    { id: "oswald-source", heading: "Oswald", body: "Source Sans 3" }, // Google
    { id: "roboto-inconsolata", heading: "Roboto", body: "Inconsolata" }, // Google
    { id: "general-gambetta", heading: "General Sans", body: "Gambetta", type: "fontshare" },
    { id: "chubbo-supreme", heading: "Chubbo", body: "Supreme", type: "fontshare" },

    // --- Serif Pairings ---
    { id: "instrument", heading: "Instrument Serif", body: "Instrument Sans" }, // Google
    { id: "libre-caslon", heading: "Libre Caslon Condensed", body: "Inter" }, // Google (Text/Condensed)
    { id: "ibm-plex", heading: "IBM Plex Serif", body: "IBM Plex Sans" }, // Google
    { id: "merriweather", heading: "Merriweather", body: "Merriweather Sans" }, // Google
    { id: "fraunces-mona", heading: "Fraunces", body: "Mona Sans", type: "fontshare" }, // Fraunces is Google, Mona is Fontshare
    { id: "bespoke-serif", heading: "Bespoke Serif", body: "Bespoke Sans", type: "fontshare" },
    { id: "alegreya", heading: "Alegreya", body: "Source Sans 3" }, // Google
    { id: "fraunces-inter", heading: "Fraunces", body: "Inter" }, // Google
    { id: "playfair", heading: "Playfair Display", body: "Libre Franklin" }, // Google
    { id: "boska-switzer", heading: "Boska", body: "Switzer", type: "fontshare" },
    { id: "roboto-slab", heading: "Roboto Slab", body: "Open Sans" }, // Google

    // --- Monospace / Tech ---
    { id: "inconsolata-karla", heading: "Inconsolata", body: "Karla" }, // Google
    { id: "jetbrains", heading: "JetBrains Mono", body: "JetBrains Mono" }, // Google
    { id: "space-lora", heading: "Space Grotesk", body: "Lora" }, // Google

    // --- Single/Other Fonts (as options) --- 
    { id: "general-sans", heading: "General Sans", body: "General Sans", type: "fontshare" },
    { id: "satoshi", heading: "Satoshi", body: "Satoshi", type: "fontshare" },
    { id: "cabinet", heading: "Cabinet Grotesk", body: "Cabinet Grotesk", type: "fontshare" },
    { id: "supreme", heading: "Supreme", body: "Supreme", type: "fontshare" },
    { id: "switzer", heading: "Switzer", body: "Switzer", type: "fontshare" },
    { id: "work-sans", heading: "Work Sans", body: "Work Sans" }, // Google
    { id: "figtree", heading: "Figtree", body: "Figtree" }, // Google
    { id: "source-sans", heading: "Source Sans 3", body: "Source Sans 3" }, // Google
    { id: "literata", heading: "Literata", body: "Literata" }, // Google
]

export const isFontshare = (fontName: string) => {
    const fontshareFonts = [
        "General Sans", "Clash Display", "Clash Grotesk", "Plein", "Switzer",
        "Pilcrow Rounded", "Gambetta", "Chubbo", "Supreme", "Mona Sans",
        "Bespoke Serif", "Bespoke Sans", "Boska", "Satoshi", "Cabinet Grotesk"
    ]
    return fontshareFonts.includes(fontName)
}

export const getFontUrls = (settings: DesignSettings) => {
    const fonts = [settings.baseFont, settings.headingFont].filter(f => f && f !== "inherit")
    if (fonts.length === 0) return { google: null, fontshare: null }

    const googleToLoad = new Set<string>()
    const fontshareToLoad = new Set<string>()

    fonts.forEach(f => {
        if (isFontshare(f)) fontshareToLoad.add(f)
        else googleToLoad.add(f)
    })

    let googleUrl = null
    let fontshareUrl = null

    // Google
    if (googleToLoad.size > 0) {
        const fontQuery = Array.from(googleToLoad).map(f => f.replace(/ /g, "+") + ":wght@300;400;500;600;700").join("&family=")
        googleUrl = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`
    }

    // Fontshare
    if (fontshareToLoad.size > 0) {
        const fsQuery = Array.from(fontshareToLoad).map(f => {
            const kebab = f.toLowerCase().replace(/ /g, "-")
            return `f[]=${kebab}@300,400,500,600,700`
        }).join("&")
        fontshareUrl = `https://api.fontshare.com/v2/css?${fsQuery}&display=swap`
    }

    return { google: googleUrl, fontshare: fontshareUrl }
}
