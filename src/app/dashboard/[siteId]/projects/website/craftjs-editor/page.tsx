"use client"

import { Editor, Element, Frame } from "@craftjs/core"
import { use, useCallback, useState } from "react"
import { toast } from "sonner"
import { CraftHeader } from "./components/CraftHeader"
import { CraftSidebar } from "./components/CraftSidebar"
import { RenderNode } from "./components/RenderNode"
import { Button, Container, Divider, Grid, Heading, Image, NavigationLinks, Spacer, Text } from "./user-components"
import { Navbar } from "./user-components/Navbar"
import { DesignProvider, useDesign } from "./components/DesignContext"

// Resolver for all user components
const resolver = {
    Container,
    Heading,
    Text,
    Button,
    Image,
    Grid,
    Divider,
    Spacer,
    Navbar,
    NavigationLinks,
}

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
                                className="canvas-preview shadow-lg transition-all duration-300 mx-auto h-full"
                                style={{
                                    width: getCanvasWidth(),
                                    minHeight: "100%",
                                    backgroundColor: "var(--design-background, #ffffff)",
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
                                        backgroundColor="var(--design-background, #ffffff)"
                                        minHeight={0}
                                        className="h-full min-h-full"
                                        custom={{ displayName: "App", isDeletable: false }}
                                    >
                                        {/* Demo Article Content */}
                                        <Element is={Heading} text="Welcome to the Page Builder" level="h1" fontSize={42} fontWeight="700" textAlign="left" />
                                        <Element is={Spacer} height={16} />
                                        <Element is={Text} text="This is a demo page to help you get started with the CraftJS editor. You can edit any text by clicking on it, and customize styles using the properties panel on the right." fontSize={18} color="#666666" />
                                        <Element is={Spacer} height={32} />
                                        <Element is={Heading} text="Getting Started" level="h2" fontSize={28} fontWeight="600" textAlign="left" />
                                        <Element is={Spacer} height={12} />
                                        <Element is={Text} text="Use the sidebar on the left to add new components. Click on any element to select it and see its properties. Try changing colors, fonts, and button styles from the Design panel!" fontSize={16} color="#444444" />
                                        <Element is={Spacer} height={24} />
                                        <Element is={Button} text="Learn More" variant="primary" size="lg" />
                                        <Element is={Spacer} height={48} />
                                        <Element is={Divider} />
                                        <Element is={Spacer} height={24} />
                                        <Element is={Text} text="Pro tip: Use the Design panel to change themes, colors, and fonts globally across your page." fontSize={14} color="#888888" />
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


