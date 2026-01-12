
// Helper to construct the full HTML document
export const generateFullHtml = (
    nodes: any,
    pageTitle: string = "Exported Page",
    preRenderedHtml?: string,
    preRenderedCss?: string
) => {
    // 1. Get Fonts
    // We look for the specific IDs we inject in EditorWithDesign
    const googleFonts = document.getElementById("design-selected-google-fonts")?.outerHTML || "";
    const fontShareFonts = document.getElementById("design-selected-fontshare-fonts")?.outerHTML || "";

    // 2. Get Design Variables (CSS Tokens)
    let cssVariables = preRenderedCss || "";

    // If no pre-rendered CSS, try to scrape (Legacy/Fallback)
    if (!preRenderedCss) {
        const canvas = document.querySelector(".canvas-preview") as HTMLElement;
        const canvasStyle = canvas ? canvas.style : null;

        // Collecting variables from .canvas-preview inline styles (User Customizations) explicitly
        if (canvasStyle) {
            for (let i = 0; i < canvasStyle.length; i++) {
                const prop = canvasStyle[i];
                if (prop.startsWith("--")) {
                    cssVariables += `        ${prop}: ${canvasStyle.getPropertyValue(prop)};\n`;
                }
            }
        }
    }

    // Collecting standard shadcn variables from Computed Styles (Theme Defaults)
    // We get the computed style of the canvas element itself if possible, or root
    let computedStyle: CSSStyleDeclaration;
    try {
        const canvas = document.querySelector(".canvas-preview") as HTMLElement;
        computedStyle = canvas ? getComputedStyle(canvas) : getComputedStyle(document.documentElement);
    } catch {
        computedStyle = getComputedStyle(document.documentElement);
    }

    const shadcnVars = [
        "--background", "--foreground",
        "--card", "--card-foreground",
        "--popover", "--popover-foreground",
        "--primary", "--primary-foreground",
        "--secondary", "--secondary-foreground",
        "--muted", "--muted-foreground",
        "--accent", "--accent-foreground",
        "--destructive", "--destructive-foreground",
        "--border", "--input", "--ring", "--radius",
        "--font-sans", "--font-serif", "--font-mono"
    ];

    shadcnVars.forEach(v => {
        const val = computedStyle.getPropertyValue(v);
        // Only append if we found a value 
        if (val) {
            cssVariables += `        ${v}: ${val};\n`;
        }
    });

    // 3. Get Content & Clean it
    let bodyContent = "";
    let cleanContainer: HTMLElement | null = null;

    if (preRenderedHtml) {
        // Use the clean export content
        cleanContainer = document.createElement("div");
        cleanContainer.innerHTML = preRenderedHtml;
    } else {
        // Legacy: Clone from DOM
        const canvas = document.querySelector(".canvas-preview") as HTMLElement;
        if (canvas) {
            cleanContainer = canvas.cloneNode(true) as HTMLElement;
        }
    }

    if (cleanContainer) {
        const clone = cleanContainer; // context alias

        // Resolve Assets (Images/Links) to Absolute URLs
        clone.querySelectorAll("img").forEach(img => {
            if (img.src) img.setAttribute("src", img.src);
        });

        clone.querySelectorAll("a").forEach(a => {
            if (a.href) a.setAttribute("href", a.href);
        });

        // Basic Cleaning
        // Remove 'contenteditable'
        clone.querySelectorAll("[contenteditable]").forEach(el => el.removeAttribute("contenteditable"));

        // Remove editor specific placeholders
        clone.querySelectorAll("div").forEach(div => {
            if (div.textContent?.trim() === "Drop components here") {
                div.remove();
            }
        });

        // Remove dashed borders
        clone.querySelectorAll(".border-dashed").forEach(el => {
            el.classList.remove("border-dashed");
            if (el.classList.contains("border-gray-300/50")) {
                el.classList.remove("border", "border-gray-300/50", "bg-gray-50/30");
            }
        });

        // Remove editor-specific styles/classes IF present (Legacy path mainly)
        clone.style.removeProperty("width");
        clone.style.removeProperty("height");
        clone.style.removeProperty("transform");
        clone.style.removeProperty("box-shadow");
        clone.style.removeProperty("margin");
        clone.style.removeProperty("overflow-y");
        clone.style.removeProperty("overflow-x");
        clone.style.removeProperty("transition");

        clone.classList.remove("canvas-preview", "shadow-lg", "overflow-y-auto", "overflow-x-hidden");

        clone.querySelectorAll("*").forEach(el => {
            if (el.getAttribute("class") === "") el.removeAttribute("class");
        });

        bodyContent = clone.innerHTML;
    } else {
        bodyContent = "<!-- Could not capture canvas content. -->";
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    
    <!-- Fonts -->
    ${googleFonts}
    ${fontShareFonts}
    
    <!-- Tailwind CSS (via CDN) -->
    <script src="https://cdn.tailwindcss.com?plugins=typography,container-queries"></script>
    
    <!-- Tailwind Configuration to match Shadcn/UI -->
    <script>
        tailwind.config = {
            darkMode: ["class"],
            theme: {
                extend: {
                    colors: {
                        border: "var(--border)",
                        input: "var(--input)",
                        ring: "var(--ring)",
                        background: "var(--background)",
                        foreground: "var(--foreground)",
                        primary: {
                            DEFAULT: "var(--primary)",
                            foreground: "var(--primary-foreground)",
                        },
                        secondary: {
                            DEFAULT: "var(--secondary)",
                            foreground: "var(--secondary-foreground)",
                        },
                        destructive: {
                            DEFAULT: "var(--destructive)",
                            foreground: "var(--destructive-foreground)",
                        },
                        muted: {
                            DEFAULT: "var(--muted)",
                            foreground: "var(--muted-foreground)",
                        },
                        accent: {
                            DEFAULT: "var(--accent)",
                            foreground: "var(--accent-foreground)",
                        },
                        popover: {
                            DEFAULT: "var(--popover)",
                            foreground: "var(--popover-foreground)",
                        },
                        card: {
                            DEFAULT: "var(--card)",
                            foreground: "var(--card-foreground)",
                        },
                    },
                    borderRadius: {
                        lg: "var(--radius)",
                        md: "calc(var(--radius) - 2px)",
                        sm: "calc(var(--radius) - 4px)",
                    },
                    fontFamily: {
                        sans: "var(--font-sans)",
                        serif: "var(--font-serif)",
                        mono: "var(--font-mono)",
                    }
                }
            }
        }
    </script>

    <style>
        :root {
${cssVariables}
        }
        
        /* Base styles */
        body { 
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            background-color: var(--background);
            color: var(--foreground);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        /* Ensure height/width consistency */
        html, body { min-height: 100vh; }
    </style>
</head>
<body>
    ${bodyContent}
    <script>
        // Simple Interaction Script for Exported HTML
        document.addEventListener('DOMContentLoaded', () => {
            // Mobile Menu Toggles
            const toggles = document.querySelectorAll('[data-mobile-toggle]');
            toggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const targetId = toggle.getAttribute('data-target');
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.classList.toggle('hidden');
                        target.classList.toggle('flex'); // Assuming flex layout for menu
                    }
                });
            });
            
            // Dropdowns (if any use generic structure)
            const dropdowns = document.querySelectorAll('.group');
            dropdowns.forEach(group => {
                // Determine if this is a click-based dropdown or hover
                // Hover is handled by CSS (group-hover), but click might be needed for mobile
                group.addEventListener('click', () => {
                    // Start logic for mobile tap
                    const submenu = group.querySelector('[data-submenu]');
                    if (submenu) {
                        submenu.classList.toggle('hidden');
                    }
                });
            });
        });
    </script>
</body>
</html>`
};
