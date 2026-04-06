"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CMSSidebar, CMSView } from "./CMSSidebar"
// Views imports
import { ArticleTable } from "@/components/ArticlesTable"
import { CategoriesTable } from "@/components/CategoriesTable"
import { CollectionsView } from "@/components/CollectionsView"
import { MediaGalleryClient } from "@/components/MediaGallery/media-gallery-client"

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
                return <ArticleTable siteId={siteId} />
            case "media":
                return <MediaGalleryClient />
            case "categories":
                return <CategoriesTable siteId={siteId} />
            case "collections":
                return <CollectionsView siteId={siteId} />
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-screen w-full h-screen p-0 gap-0 overflow-hidden flex bg-background focus:outline-none">
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
