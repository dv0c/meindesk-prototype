

// Helper to construct the full HTML document
export const generateFullHtml = (
    nodes: any,
    pageTitle: string = "Exported Page",
) => {
    // 1. Get Fonts
    // We look for the specific IDs we inject in EditorWithDesign
    const googleFonts = document.getElementById("design-selected-google-fonts")?.outerHTML || "";
    const fontShareFonts = document.getElementById("design-selected-fontshare-fonts")?.outerHTML || "";

    // 2. Get Design Variables (CSS Tokens) using Computed Styles from the canvas
    // This ensures we capture the resolved values of all variables, including those from active themes/classes (dark mode, modern, etc.)
    const canvas = document.querySelector(".canvas-preview") as HTMLElement;
    let cssVariables = "";

    // We get the computed style of the canvas element itself, which inherits all theme variabes
    const computedStyle = canvas ? getComputedStyle(canvas) : getComputedStyle(document.documentElement);
    const canvasStyle = canvas ? canvas.style : null;

    // Helper to extract vars
    // We prioritize the computed value as it represents the "live" look (including inherited theme classes)

    // Collecting variables from .canvas-preview inline styles (User Customizations) explicitly
    // This preserves exact definitions if they are setting specific vars
    if (canvasStyle) {
        for (let i = 0; i < canvasStyle.length; i++) {
            const prop = canvasStyle[i];
            if (prop.startsWith("--")) {
                // For the export, we want the resolved value if possible, or the literal value
                // Literal value is better for "settings", but resolved value is better for "visual fidelity" of themes.
                // Let's stick to the inline value for specific overrides, it usually works fine.
                cssVariables += `        ${prop}: ${canvasStyle.getPropertyValue(prop)};\n`;
            }
        }
    }

    // Collecting standard shadcn variables from Computed Styles (Theme Defaults)
    // This catches variables that are defined in global CSS classes (like .dark or .modern)
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
        // We always append standard vars with their computed values to ensure full theme resolution
        // The last definition in :root wins, or we can just append if missing. 
        // CSS rules: last one wins. If we added inline vars above, they might be the same.
        // Let's just ensure we capture the *computed* value for these system tokens.
        const val = computedStyle.getPropertyValue(v);
        if (val) {
            cssVariables += `        ${v}: ${val};\n`;
        }
    });

    // 3. Get Content & Clean it
    let bodyContent = "";
    if (canvas) {
        // Clone to avoid modifying live DOM
        const clone = canvas.cloneNode(true) as HTMLElement;

        // Resolve Assets (Images/Links) to Absolute URLs
        // The .src and .href properties return the absolute URL, while .getAttribute returns the raw value.
        // We update the attribute to the absolute value so it works in the standalone file.
        clone.querySelectorAll("img").forEach(img => {
            if (img.src) img.setAttribute("src", img.src);
        });

        clone.querySelectorAll("a").forEach(a => {
            if (a.href) a.setAttribute("href", a.href);
        });

        // Basic Cleaning
        // Remove 'contenteditable'
        clone.querySelectorAll("[contenteditable]").forEach(el => el.removeAttribute("contenteditable"));

        // Remove editor specific placeholders ("Drop components here")
        // These are artifacts of the editor when containers are empty
        clone.querySelectorAll("div").forEach(div => {
            if (div.textContent?.trim() === "Drop components here") {
                div.remove();
            }
        });

        // Remove dashed borders (structural indicators in editor)
        clone.querySelectorAll(".border-dashed").forEach(el => {
            el.classList.remove("border-dashed");
            // potentially remove 'border' too if it was only for the dashed line
            if (el.classList.contains("border-gray-300/50")) {
                el.classList.remove("border", "border-gray-300/50", "bg-gray-50/30");
            }
        });

        // Remove editor-specific styles and classes from the root wrapper
        // The root wrapper (.canvas-preview) contains hardcoded width/transform/scale for the editor UI.
        // We want the exported page to be responsive, letting the body control the layout.

        // Instead of removing all styles (which kills the background color), we only remove layout constraints
        clone.style.removeProperty("width");
        clone.style.removeProperty("height");
        clone.style.removeProperty("transform");
        clone.style.removeProperty("box-shadow");
        clone.style.removeProperty("margin");
        clone.style.removeProperty("overflow-y");
        clone.style.removeProperty("overflow-x");
        clone.style.removeProperty("transition");

        // Remove typical ClassNames that might constrain layout
        clone.classList.remove("canvas-preview", "shadow-lg", "overflow-y-auto", "overflow-x-hidden");

        // Remove empty class attributes from children (cleanup)
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
</body>
</html>`;
};
