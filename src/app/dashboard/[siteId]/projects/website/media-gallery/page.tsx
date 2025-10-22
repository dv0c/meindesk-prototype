"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import MediaLibraryDialog from "@/components/MediaGallery/media-select"
import { useTeam } from "@/hooks/useTeam"
import { MediaGalleryClient } from "@/components/MediaGallery/media-gallery-client"

export default function ExamplePage() {
  const team = useTeam().team?.id
  const [isMediaOpen, setIsMediaOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<any[]>([])

  const handleSelect = (items: any[]) => {
    setSelectedImages(items)
    console.log("Selected media:", items)
  }

  return (
    <div className="p-10">
      <Button onClick={() => setIsMediaOpen(true)}>Open Media Library</Button>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {selectedImages.map((img) => (
          <img
            key={img.id}
            src={img.url}
            alt={img.alt || ""}
            className="w-full h-32 object-cover rounded-lg border"
          />
        ))}
      </div>

      <MediaLibraryDialog
        siteId={team}
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleSelect}
        multiSelect={true}
      />
      <MediaGalleryClient />
    </div>
  )
}
