"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { UploadCloud, ImageIcon, Search, Trash2, Check } from "lucide-react"
import { CldUploadButton } from "next-cloudinary"

export interface MediaItem {
  id: string
  url: string
  alt?: string
  createdAt: string
  public_id?: string
  name?: string
  size?: number
  width?: number
  height?: number
  type?: string
}

interface MediaLibraryDialogProps {
  siteId: string
  isOpen: boolean
  onClose: () => void
  onSelect: (items: MediaItem[]) => void
  multiSelect?: boolean
}

function MediaItemCard({
  media,
  isSelected,
  onSelect,
  onDelete,
}: {
  media: MediaItem
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 500) // Show tooltip after 500ms hover
    setHoverTimer(timer)
  }

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      setHoverTimer(null)
    }
    setShowTooltip(false)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div
      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${isSelected
        ? "border-primary shadow-lg scale-[1.02] ring-2 ring-primary/20"
        : "border-transparent hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
        }`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={media.url || "/placeholder.svg"}
        alt={media.alt || "Media"}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Selected overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] rounded-lg transition-opacity duration-200">
          <div className="absolute top-2 left-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
            <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Delete button - always visible on hover */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="!bg-destructive hover:!bg-destructive/90 shadow-lg"
          variant={'destructive'}
          size={'icon-sm'}
          aria-label="Delete media"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Hover tooltip with media details */}
      {showTooltip && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white p-3 flex flex-col justify-end text-xs space-y-1 z-20 pointer-events-none animate-in fade-in-0 duration-200">
          <p className="font-semibold truncate text-sm">{media.name || "Untitled"}</p>
          {media.width && media.height && (
            <p className="text-white/90 text-[11px]">
              {media.width} × {media.height}px
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-white/80">{formatFileSize(media.size)}</p>
            {media.type && <p className="text-white/80 uppercase text-[10px]">{media.type.split("/")[1]}</p>}
          </div>
          <p className="text-white/60 text-[10px]">{formatDate(media.createdAt)}</p>
        </div>
      )}
    </div>
  )
}

export default function MediaLibraryDialog({
  siteId,
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
}: MediaLibraryDialogProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [filteredMediaItems, setFilteredMediaItems] = useState<MediaItem[]>([])
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("library")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMedia = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/team/${siteId}/media-gallery`)
      const media = response.data.media || []
      setMediaItems(media)
      setFilteredMediaItems(media)
    } catch (error) {
      console.error("Failed to fetch media:", error)
      toast.error("Failed to load media library.")
    } finally {
      setIsLoading(false)
    }
  }, [siteId])

  useEffect(() => {
    if (isOpen) fetchMedia()
  }, [isOpen, fetchMedia])

  useEffect(() => {
    // Improved search: search across name, alt, and URL
    const filtered = mediaItems.filter((m) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        m.name?.toLowerCase().includes(searchLower) ||
        m.alt?.toLowerCase().includes(searchLower) ||
        m.url.toLowerCase().includes(searchLower)
      )
    })
    setFilteredMediaItems(filtered)
  }, [searchTerm, mediaItems])

  const handleSelectMedia = (media: MediaItem) => {
    if (multiSelect) {
      setSelectedItems((prev) =>
        prev.some((item) => item.id === media.id) ? prev.filter((item) => item.id !== media.id) : [...prev, media],
      )
    } else {
      setSelectedItems([media])
    }
  }

  const handleDeleteClick = (media: MediaItem) => {
    setMediaToDelete(media)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete?.public_id) {
      toast.error("Cannot delete: missing public_id")
      return
    }

    setIsDeleting(true)
    try {
      await axios.delete(`/api/team/${siteId}/media-gallery?public_id=${encodeURIComponent(mediaToDelete.public_id)}`)
      toast.success("Media deleted successfully")

      // Remove from selected items if it was selected
      setSelectedItems((prev) => prev.filter((item) => item.id !== mediaToDelete.id))

      // Refresh media list
      await fetchMedia()
    } catch (error: any) {
      console.error("Failed to delete media:", error)
      const errorMessage = error.response?.data?.error || "Failed to delete media"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setMediaToDelete(null)
    }
  }

  const handleUploadSuccess = async (result: any) => {
    setActiveTab("library")
    toast.success("Upload successful!")
    fetchMedia()
  }

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one image.")
      return
    }
    onSelect(selectedItems)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="!max-w-5xl w-full h-[80vh] flex flex-col p-0 z-[150]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-grow flex flex-col overflow-hidden p-6 pt-2"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <TabsList>
                <TabsTrigger value="library">Media Library</TabsTrigger>
              </TabsList>
              <CldUploadButton
                options={{
                  folder: `${siteId}/uploads/`,
                  clientAllowedFormats: ["png", "gif", "jpeg", "webp"],
                  maxFileSize: 5 * 1024 * 1024,
                  tags: siteId
                    ? ["gallery_image", siteId, "user_upload"]
                    : ["gallery_image", "user_upload"],
                  context: {
                    site_id: siteId || "",
                    upload_source: "media_gallery",
                  },
                }}
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "prototype"}
                onSuccess={handleUploadSuccess}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload New
              </CldUploadButton>
            </div>

            <TabsContent value="library" className="flex-grow overflow-hidden flex flex-col mt-0">
              <div className="relative mb-4 shrink-0">
                <Input
                  placeholder="Search by name, description, or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <ScrollArea className="flex-grow">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-1">
                    {[...Array(12)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : filteredMediaItems.length === 0 ? (
                  <div className="text-center py-10">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No media found.</p>
                    {searchTerm && <p className="text-xs text-muted-foreground">Try a different search term.</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-1">
                    {filteredMediaItems.map((media) => (
                      <MediaItemCard
                        key={media.id}
                        media={media}
                        isSelected={selectedItems.some((item) => item.id === media.id)}
                        onSelect={() => handleSelectMedia(media)}
                        onDelete={() => handleDeleteClick(media)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="p-6 pt-4 border-t shrink-0">
            <p className="text-sm text-muted-foreground mr-auto">{selectedItems.length} item(s) selected</p>
            <Button variant="outline" className="cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="cursor-pointer" disabled={selectedItems.length === 0 && multiSelect}>
              {multiSelect ? `Insert ${selectedItems.length} Item(s)` : "Insert Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{mediaToDelete?.name || "this media"}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
