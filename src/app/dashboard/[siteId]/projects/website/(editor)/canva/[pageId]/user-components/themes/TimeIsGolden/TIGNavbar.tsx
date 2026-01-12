"use client"

import { Element, useNode } from "@craftjs/core"
import { PropertyRow, PropertySection } from "../../../components/PropertySection"
import { Button } from "../../Button"
import { Container } from "../../Container"
import { Search } from "../../Search"
import { Text } from "../../Text"

export const TIGNavbar = ({ ...props }) => {
    const { connectors: { connect, drag } } = useNode()

    return (
        <div ref={(ref: any) => connect(drag(ref))} className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
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

                {/* Desktop Menu Wrapper */}
                <div className="hidden md:flex flex-row items-center gap-4">
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
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    data-mobile-toggle
                    data-target="tig-mobile-menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>

            </Element>

            {/* Mobile Menu Content (Hidden by default, toggled via script) */}
            <div id="tig-mobile-menu" className="hidden md:hidden absolute top-full left-0 w-full bg-background border-b p-4 flex flex-col gap-4 shadow-lg z-50">
                {/* Simplified Mobile Links (Static for now as duplication of Element is complex) */}
                <div className="flex flex-col gap-2">
                    <a href="#" className="p-2 hover:bg-muted rounded">Subscribe</a>
                    <a href="#" className="p-2 hover:bg-muted rounded">Login</a>
                </div>
            </div>
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
