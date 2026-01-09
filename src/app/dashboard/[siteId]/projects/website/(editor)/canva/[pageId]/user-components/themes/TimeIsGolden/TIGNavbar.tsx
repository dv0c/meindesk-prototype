"use client"

import { useNode, Element } from "@craftjs/core"
import { Text } from "../../Text"
import { Container } from "../../Container"
import { Search } from "../../Search"
import { Button } from "../../Button"
import { NavigationLinks } from "../../NavigationLinks"
import { PropertySection, PropertyRow, PropertyInput } from "../../../components/PropertySection"
import React from "react"

export const TIGNavbar = ({ ...props }) => {
    const { connectors: { connect, drag } } = useNode()

    return (
        <div ref={(ref: any) => connect(drag(ref))} className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Element
                is={Container}
                id="tig-navbar-container"
                width="100%"
                maxWidth="1200px"
                padding={20}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                backgroundColor="transparent"
                canvas
            >
                {/* Logo Section */}
                <Element
                    is={Container}
                    id="tig-navbar-logo"
                    width="auto"
                    padding={0}
                    key="logo"
                    backgroundColor="transparent"
                    canvas
                >
                    <Text text="G O L D E N" fontSize={24} fontWeight="bold" letterSpacing={4} />
                </Element>

                {/* Search Section */}
                <Element
                    is={Container}
                    id="tig-navbar-search"
                    width="400px"
                    padding={0}
                    key="search"
                    backgroundColor="transparent"
                    alignItems="center"
                    justifyContent="center"
                    canvas
                >
                    <Search width="100%" overlayTheme="minimal" placeholder="Search articles..." />
                </Element>

                {/* Actions/Nav Section */}
                <Element
                    is={Container}
                    id="tig-navbar-actions"
                    width="auto"
                    padding={0}
                    key="actions"
                    backgroundColor="transparent"
                    flexDirection="row"
                    gap={20}
                    alignItems="center"
                    canvas
                >
                    <Button text="Subscribe" variant="primary" size="sm" />
                    <Button text="Login" variant="ghost" size="sm" />
                </Element>

            </Element>
        </div>
    )
}

export const TIGNavbarSettings = () => {
    return (
        <PropertySection title="Navbar">
            <PropertyRow label="Note">
                <span className="text-xs text-muted-foreground">Modify inner elements to change content.</span>
            </PropertyRow>
        </PropertySection>
    )
}

TIGNavbar.craft = {
    displayName: "TIG Navbar",
    category: "Time is Golden",
    props: {},
    settings: TIGNavbarSettings
}
