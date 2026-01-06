"use client"

import React, { useMemo, Component, ReactNode } from "react"
import { useDesign } from "./DesignContext"
import { LayoutTemplate } from "lucide-react"

// Error boundary to catch CraftJS context errors when rendering templates outside Editor
class PreviewErrorBoundary extends Component<
    { children: ReactNode; fallback?: ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: Error) {
        // Silently catch CraftJS context errors in preview mode
        console.debug("Preview render fallback:", error.message)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
                    <LayoutTemplate className="w-12 h-12 text-muted-foreground/30" />
                </div>
            )
        }
        return this.props.children
    }
}

interface TemplatePreviewProps {
    children: React.ReactNode
    scale?: number
    width?: number
    height?: number
    icon?: React.ElementType
}

/**
 * Renders template content in an isolated, scaled-down container
 * for preview purposes. Falls back to icon if components require CraftJS context.
 */
export function TemplatePreview({
    children,
    scale = 0.2,
    width = 1200,
    height = 600,
    icon: Icon = LayoutTemplate
}: TemplatePreviewProps) {
    const { getCssVariables } = useDesign()

    // Parse CSS variables into style object
    const cssVars = useMemo(() => {
        const varsString = getCssVariables()
        return Object.fromEntries(
            varsString
                .split(';')
                .filter((s: string) => s.trim())
                .map((s: string) => {
                    const [key, value] = s.split(':').map((x: string) => x.trim())
                    return [key, value]
                })
        )
    }, [getCssVariables])

    const fallback = (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-muted/30">
            <Icon className="w-12 h-12 text-muted-foreground/40" />
        </div>
    )

    return (
        <div
            className="relative overflow-hidden rounded-lg bg-white"
            style={{
                width: width * scale,
                height: height * scale,
            }}
        >
            <PreviewErrorBoundary fallback={fallback}>
                <div
                    style={{
                        width: width,
                        height: height,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        pointerEvents: "none",
                        overflow: "hidden",
                        ...cssVars,
                    }}
                >
                    {children}
                </div>
            </PreviewErrorBoundary>
        </div>
    )
}
