"use client"

import React from "react"
import { defineBlock, useBlockStyles } from "@/lib/block-api"
import { Spacing } from "../styles/spacing"
import { Element } from "@craftjs/core"
import { PanelBottom } from "lucide-react"
import { EditableText } from "../../../lib/withCraftComponent"
import { Container } from "../../Container"

export const DefaultFooter = defineBlock({
    name: "Default Footer",
    category: "Theme",
    icon: <PanelBottom className="w-4 h-4" />,
    defaultProps: {
        style: {
            paddingTop: '4rem',
            paddingBottom: '4rem',
            backgroundColor: 'var(--theme-primary)', // Dark background
            color: 'var(--theme-background)', // Light text on dark
        }
    },
    render: ({ style, theme, responsive, isEditing, deviceMode }) => {
        const { style: blockStyle, className } = useBlockStyles({ style, responsive, isEditing, deviceMode })

        return (
            <footer style={blockStyle} className={className}>
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8" style={{ maxWidth: Spacing.container.maxWidth, paddingLeft: '1rem', paddingRight: '1rem' }}>

                    {/* Column 1: Brand */}
                    <div className="flex flex-col gap-4">
                        <EditableText
                            propName="footerTitle"
                            value="My Website"
                            as="h4"
                            className="text-lg font-bold"
                            style={{ color: 'inherit' }}
                        />
                        <EditableText
                            propName="footerDesc"
                            value="A short description about the website or company goes here."
                            as="p"
                            className="text-sm opacity-80"
                            style={{ color: 'inherit' }}
                        />
                    </div>

                    {/* Column 2: Links (Editable Area) */}
                    <div className="flex flex-col gap-4">
                        <EditableText propName="col2Title" value="Company" as="h5" className="font-bold mb-2" style={{ color: 'inherit' }} />
                        <Element id="footer-col-2" is={Container} canvas>
                            {/* Users can drop links here */}
                            <div className="p-2 border border-dashed border-white/20 text-xs text-center opacity-50">Drop Content</div>
                        </Element>
                    </div>

                    {/* Column 3: Links (Editable Area) */}
                    <div className="flex flex-col gap-4">
                        <EditableText propName="col3Title" value="Resources" as="h5" className="font-bold mb-2" style={{ color: 'inherit' }} />
                        <Element id="footer-col-3" is={Container} canvas>
                            <div className="p-2 border border-dashed border-white/20 text-xs text-center opacity-50">Drop Content</div>
                        </Element>
                    </div>

                    {/* Column 4: Newsletter or Social */}
                    <div className="flex flex-col gap-4">
                        <EditableText propName="col4Title" value="Stay Connected" as="h5" className="font-bold mb-2" style={{ color: 'inherit' }} />
                        <Element id="footer-col-4" is={Container} canvas>
                            <div className="p-2 border border-dashed border-white/20 text-xs text-center opacity-50">Drop Content</div>
                        </Element>
                    </div>

                </div>

                <div className="container mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-60" style={{ maxWidth: Spacing.container.maxWidth }}>
                    <EditableText propName="copyright" value="© 2024. All rights reserved." as="span" style={{ color: 'inherit' }} />
                </div>
            </footer>
        )
    }
})
