"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CMSSidebar, CMSView } from "./CMSSidebar"
// Views will be imported here
import { CMSArticlesView } from "./views/CMSArticlesView"
import { CMSCategoriesView } from "./views/CMSCategoriesView"
import { CMSCollectionsView } from "./views/CMSCollectionsView"
import { CMSMediaGalleryView } from "./views/CMSMediaGalleryView"

interface CMSModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    siteId: string
}

export function CMSModal({ open, onOpenChange, siteId }: CMSModalProps) {
    const [activeView, setActiveView] = useState<CMSView>("articles")

    const renderContent = () => {
        switch (activeView) {
            case "articles":
                return <CMSArticlesView siteId={siteId} />
            case "media":
                return <CMSMediaGalleryView siteId={siteId} />
            case "categories":
                return <CMSCategoriesView siteId={siteId} />
            case "collections":
                return <CMSCollectionsView siteId={siteId} />
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-screen w-full h-screen p-0 gap-0 overflow-hidden flex bg-background focus:outline-none z-[101]" showClose={false}>
                <CMSSidebar
                    activeView={activeView}
                    setActiveView={setActiveView}
                    onClose={() => onOpenChange(false)}
                />

                <div className="flex-1 flex flex-col h-full min-w-0 bg-background/50">
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    )
}
