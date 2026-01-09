"use client"

import React from "react"
import { defineBlock, useBlockStyles } from "@/lib/block-api"
import { Spacing } from "../styles/spacing"
import { Layout } from "lucide-react"
import { Element } from "@craftjs/core"
import { Container } from "../../Container"

export const Section = defineBlock({
    name: "Theme Section",
    category: "Layout",
    icon: <Layout className="w-4 h-4" />,
    defaultProps: {
        style: {
            paddingTop: Spacing.section.paddingY,
            paddingBottom: Spacing.section.paddingY,
            backgroundColor: 'var(--theme-background)',
            width: '100%',
        }
    },
    settings: ({ style, onChange }) => {
        // Placeholder for real settings component
        return (
            <div className="p-4">
                <p className="text-sm text-muted-foreground">Adjust styling in the Styles tab.</p>
            </div>
        )
    },
    render: ({ children, style, theme }) => {
        const { style: blockStyle, className } = useBlockStyles({ style })

        return (
            <section
                style={blockStyle}
                className={className}
            >
                <div className="mx-auto" style={{ maxWidth: Spacing.container.maxWidth, paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <Element id="content" is={Container} canvas>
                        {children}
                    </Element>
                </div>
            </section>
        )
    }
})
