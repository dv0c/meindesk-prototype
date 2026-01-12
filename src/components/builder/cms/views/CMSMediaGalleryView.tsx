"use client"

import { MediaGalleryClient } from "@/components/MediaGallery/media-gallery-client"

interface CMSMediaGalleryViewProps {
    siteId: string
}

export function CMSMediaGalleryView({ siteId }: CMSMediaGalleryViewProps) {
    return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
            <div className="mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Media Library</h2>
                <p className="text-muted-foreground text-sm">Manage your site images and assets</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <MediaGalleryClient />
            </div>
        </div>
    )
}
