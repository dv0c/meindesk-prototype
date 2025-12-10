"use client"

import MediaLibraryDialog, { type MediaItem } from "@/components/MediaGallery/media-select"
import { useParams } from "next/navigation"

interface MediaGalleryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (url: string) => void
}

export function MediaGalleryModal({ open, onOpenChange, onSelect }: MediaGalleryModalProps) {
    const params = useParams()
    const siteId = params.siteId as string

    return (
        <MediaLibraryDialog
            siteId={siteId}
            isOpen={open}
            onClose={() => onOpenChange(false)}
            onSelect={(items: MediaItem[]) => {
                if (items.length > 0) {
                    onSelect(items[0].url)
                }
                onOpenChange(false)
            }}
            multiSelect={false}
        />
    )
}
