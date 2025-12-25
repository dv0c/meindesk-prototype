"use client"

import { use, useState, useCallback } from "react"
import { Editor, Frame, Element } from "@craftjs/core"
import { CraftHeader } from "./components/CraftHeader"
import { CraftSidebar } from "./components/CraftSidebar"
import { RenderNode } from "./components/RenderNode"
import { Container, Heading, Text, Button, Image, Grid, Divider, Spacer } from "./user-components"
import { Navbar } from "./user-components/Navbar"
import { toast } from "sonner"
import { Plus } from "lucide-react"

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
        <Editor resolver={resolver} onRender={RenderNode}>
            <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
                {/* Header */}
                <CraftHeader
                    pageName={pageName}
                    setPageName={setPageName}
                    deviceMode={deviceMode}
                    setDeviceMode={setDeviceMode}
                    onSave={handleSave}
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
                                className="canvas-preview shadow-lg transition-all duration-300 bg-white dark:bg-zinc-950 mx-auto h-full"
                                style={{
                                    width: getCanvasWidth(),
                                    minHeight: "100%",
                                }}
                            >
                                <Frame>
                                    <Element
                                        is={Container}
                                        canvas
                                        padding={20}
                                        backgroundColor="#ffffff"
                                        minHeight={0}
                                        className="h-full min-h-full"
                                    >
                                        {/* Empty canvas placeholder */}
                                    </Element>
                                </Frame>
                            </div>
                        </div>

                        {/* Empty State Helper */}
                        <EmptyStateOverlay />
                    </div>
                </div>
            </div>
        </Editor>
    )
}

// Component to show helpful overlay when canvas is empty
function EmptyStateOverlay() {
    // This will be shown as part of the Container component when empty
    return null
}
