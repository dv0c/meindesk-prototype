"use client"

import React from "react"
import { defineBlock, useBlockStyles } from "@/lib/block-api"
import { Spacing } from "../styles/spacing"
import { Element } from "@craftjs/core"
import { EditableImage, EditableText } from "../../../lib/withCraftComponent"
import { NavigationLinks } from "../../NavigationLinks"
import { PanelTop } from "lucide-react"

export const DefaultHeader = defineBlock({
    name: "Default Header",
    category: "Theme",
    icon: <PanelTop className="w-4 h-4" />,
    defaultProps: {
        logo: "https://via.placeholder.com/150x50?text=Logo",
        style: {
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            backgroundColor: 'var(--theme-surface)',
            borderBottomWidth: 1,
            borderBottomColor: 'var(--theme-border)',
            borderBottomStyle: 'solid',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }
    },
    render: ({ logo, style, theme, responsive, isEditing, deviceMode }) => {
        const { style: blockStyle, className } = useBlockStyles({ style, responsive, isEditing, deviceMode })

        return (
            <header style={blockStyle} className={className}>
                <div className="container mx-auto flex items-center justify-between" style={{ maxWidth: Spacing.container.maxWidth, paddingLeft: '1rem', paddingRight: '1rem' }}>

                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <EditableImage
                            propName="logo"
                            src={logo}
                            alt="Logo"
                            className="h-10 w-auto object-contain"
                        />
                        <EditableText
                            propName="siteName"
                            value="My Website"
                            as="span"
                            className="font-bold text-xl tracking-tight hidden sm:block"
                        />
                    </div>

                    {/* Navigation */}
                    <nav>
                        <Element id="nav-links" is={NavigationLinks} canvas />
                    </nav>

                </div>
            </header>
        )
    }
})
