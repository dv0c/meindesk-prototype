"use client"

import { Editor, Element, Frame } from "@craftjs/core"
import { use, useCallback, useState } from "react"
import { toast } from "sonner"
import { CraftHeader } from "./components/CraftHeader"
import { CraftSidebar } from "./components/CraftSidebar"
import { RenderNode } from "./components/RenderNode"
import { Button, Container, Divider, Grid, Heading, Image, NavigationLinks, Spacer, Text, Card, componentMap } from "./user-components"
import { Navbar } from "./user-components/Navbar"
import { DesignProvider, useDesign } from "./components/DesignContext"
import { MarketplaceProvider } from "./components/MarketplaceContext"

// Resolver for all user components - now using componentMap from registry
// This automatically includes all components registered in registry.tsx
const resolver = componentMap

export default function CraftJSEditorPage({ params }: { params: { siteId: string } }) {
    const { siteId } = use(params as unknown as Promise<{ siteId: string }>)
    const [pageName, setPageName] = useState("CraftJS Demo Page")
    const [isSaving, setIsSaving] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)
    const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

    const handleSave = useCallback(async () => {
        setIsSaving(true)
        try {
            // For now, just show a success toast - actual save will be implemented later
            toast.success("Page saved successfully (demo)")
        } catch (error) {
            console.error("Failed to save:", error)
            toast.error("Failed to save page")
        } finally {
            setIsSaving(false)
        }
    }, [])

    // Device width based on mode
    const getCanvasWidth = () => {
        switch (deviceMode) {
            case "mobile":
                return "375px"
            case "tablet":
                return "768px"
            default:
                return "100%"
        }
    }

    return (
        <DesignProvider>
            <MarketplaceProvider>
                <EditorWithDesign
                    resolver={resolver}
                    pageName={pageName}
                    setPageName={setPageName}
                    deviceMode={deviceMode}
                    setDeviceMode={setDeviceMode}
                    onSave={handleSave}
                    isSaving={isSaving}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    siteId={siteId}
                    getCanvasWidth={getCanvasWidth}
                />
            </MarketplaceProvider>
        </DesignProvider>
    )
}

// Separate component to access design context
function EditorWithDesign({ resolver, pageName, setPageName, deviceMode, setDeviceMode, onSave, isSaving, showSidebar, setShowSidebar, siteId, getCanvasWidth }: any) {
    const { getCssVariables } = useDesign()

    return (
        <Editor resolver={resolver} onRender={RenderNode}>
            <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
                {/* Header */}
                <CraftHeader
                    pageName={pageName}
                    setPageName={setPageName}
                    deviceMode={deviceMode}
                    setDeviceMode={setDeviceMode}
                    onSave={onSave}
                    isSaving={isSaving}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    siteId={siteId}
                />

                {/* Main Content */}
                <div className="flex-1 flex h-full overflow-hidden">
                    {/* Sidebar */}
                    {showSidebar && <CraftSidebar />}

                    {/* Canvas Area */}
                    <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                        <div className="overflow-auto h-full bg-zinc-50 dark:bg-zinc-900 p-5">
                            <div
                                className="canvas-preview shadow-lg transition-all duration-300 mx-auto h-full overflow-y-auto overflow-x-hidden"
                                style={{
                                    width: getCanvasWidth(),
                                    minHeight: "100%",
                                    backgroundColor: "var(--design-background, #ffffff)",
                                    containerType: "inline-size",
                                    ...Object.fromEntries(
                                        getCssVariables()
                                            .split(';')
                                            .filter(s => s.trim())
                                            .map(s => {
                                                const [key, value] = s.split(':').map(x => x.trim())
                                                return [key, value]
                                            })
                                    )
                                }}
                            >
                                <Frame>
                                    <Element
                                        is={Container}
                                        canvas
                                        padding={40}
                                        paddingTop="0"
                                        paddingRight="0"
                                        paddingBottom="0"
                                        paddingLeft="0"
                                        gap={16}
                                        backgroundColor="var(--design-background, #ffffff)"
                                        minHeight="100%"
                                        flexDirection="column"
                                        alignItems="stretch"
                                        custom={{ displayName: "App", isDeletable: false }}
                                    >
                                        {/* Demo Article Content */}
                                    </Element>
                                </Frame>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Editor >
    )
}


