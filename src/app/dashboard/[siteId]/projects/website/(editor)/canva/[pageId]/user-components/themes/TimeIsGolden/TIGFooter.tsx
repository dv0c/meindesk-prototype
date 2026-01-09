"use client"

import { useNode, Element } from "@craftjs/core"
import { Text } from "../../Text"
import { Container } from "../../Container"
import { PropertySection, PropertyRow } from "../../../components/PropertySection"
import { Separator } from "@/components/ui/separator"
import React from "react"
import { Button } from "../../Button"

export const TIGFooter = ({ ...props }) => {
    const { connectors: { connect, drag } } = useNode()

    return (
        <div ref={(ref: any) => connect(drag(ref))} className="w-full mt-24">
            <Element
                is={Container}
                id="tig-footer-container"
                width="100%"
                padding={60}
                backgroundColor="#111" // Dark background
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                canvas
            >
                {/* Brand */}
                <Text text="G O L D E N" fontSize={20} color="#fff" fontWeight="bold" letterSpacing={4} marginBottom={24} />

                {/* Nav Links */}
                <Element
                    is={Container}
                    id="tig-footer-links"
                    width="auto"
                    padding={0}
                    flexDirection="row"
                    gap={24}
                    marginBottom={40}
                    backgroundColor="transparent"
                    canvas
                >
                    <Text text="Home" color="#888" fontSize={14} />
                    <Text text="Stories" color="#888" fontSize={14} />
                    <Text text="About" color="#888" fontSize={14} />
                    <Text text="Contact" color="#888" fontSize={14} />
                </Element>

                {/* Socials - Using generic container mimicking icons since we don't have Icon component wrapper ready-to-drop easily without more boilerplate, 
                    but actually we can just render icons directly as this is a specific component */}
                {/* Socials */}
                <Element
                    is={Container}
                    id="tig-footer-socials"
                    width="auto"
                    padding={0}
                    flexDirection="row"
                    gap={10}
                    marginBottom={32}
                    backgroundColor="transparent"
                    canvas
                >
                    <Button text="Twitter" variant="ghost" size="sm" textColor="#888" />
                    <Button text="Instagram" variant="ghost" size="sm" textColor="#888" />
                    <Button text="LinkedIn" variant="ghost" size="sm" textColor="#888" />
                </Element>

                <div className="w-full max-w-md h-px bg-zinc-800 mb-8" />

                <Text text="© 2024 Time is Golden. All rights reserved." color="#444" fontSize={12} />

            </Element>
        </div>
    )
}

export const TIGFooterSettings = () => {
    return (
        <PropertySection title="Footer">
            <PropertyRow label="Note">
                <span className="text-xs text-muted-foreground">Footer content is editable on canvas.</span>
            </PropertyRow>
        </PropertySection>
    )
}

TIGFooter.craft = {
    displayName: "TIG Footer",
    category: "Time is Golden",
    props: {},
    settings: TIGFooterSettings
}
