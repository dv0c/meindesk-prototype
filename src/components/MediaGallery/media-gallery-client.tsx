"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
// @ts-ignore
import { CldUploadButton, type CldUploadWidgetResults, type CldErrorEvent } from "next-cloudinary"
import {
  UploadCloud,
  Search,
  MoreVertical,
  Trash2,
  Download,
  Copy,
  Eye,
  Loader2,
  ImageIcon,
  Grid3X3,
  List,
} from "lucide-react"
import { formatTimeLeft } from "@/lib/utils"
import type { Media } from "@/types/media-gallery"
import { ScrollArea } from "../ui/scroll-area"

export function MediaGalleryClient() {
  const params = useParams()
  const siteId = params.siteId as string

  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [filteredItems, setFilteredItems] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const fetchMedia = useCallback(async () => {
    if (!siteId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/team/${siteId}/media-gallery/`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 429) {
          const retryAfter = errorData.retryAfterSeconds ? formatTimeLeft(errorData.retryAfterSeconds) : "a moment"
          throw new Error(`Rate limit exceeded. Please try again in ${retryAfter}.`)
        }
        throw new Error(errorData.error || `Failed to fetch media: ${response.statusText}`)
      }

      const data = await response.json()
      const fetchedMedia: Media[] = data.media || []
      setMediaItems(fetchedMedia)
    } catch (error) {
      console.error("Error fetching media:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load media")
    } finally {
      setIsLoading(false)
    }
  }, [siteId])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  useEffect(() => {
    const filtered = mediaItems.filter((item) => {
      const searchableName = item.name || ""
      const searchablePublicId = item.public_id || ""
      return (
        searchableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchablePublicId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    setFilteredItems(filtered)
  }, [mediaItems, searchTerm])

  const handleUploadSuccess = (result: CldUploadWidgetResults) => {
    setIsUploading(false)
    if (result.event === "success" && typeof result.info === "object" && result.info !== null) {
      const info = result.info as { original_filename?: string; public_id: string; secure_url: string }
      toast.success(`Image "${info.original_filename || info.public_id}" uploaded successfully!`)
      fetchMedia()
    }
  }

  const handleUploadError = (errorEvent: CldErrorEvent) => {
    setIsUploading(false)
    let errorMessage = "Upload failed. Please try again."
    if (typeof errorEvent === "object" && errorEvent !== null && "status" in errorEvent) {
      const status = (errorEvent as { status: number }).status
      if (status === 420 || status === 429) {
        errorMessage = "Upload failed: Rate limit exceeded. Please try again later."
      }
    }
    toast.error(errorMessage)
  }

  const handleDeleteClick = (item: Media) => {
    setItemToDelete(item)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete || !siteId) {
      toast.error("Cannot delete image: Missing image data or Site ID.")
      return
    }

    setIsDeleting(itemToDelete.public_id)
    setShowDeleteConfirm(false)

    try {
      const response = await fetch(
        `/api/team/${siteId}/media-gallery?public_id=${encodeURIComponent(itemToDelete.public_id)}&siteId=${encodeURIComponent(siteId)}`,
        { method: "DELETE" },
      )

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorResult.error || `Failed to delete image. Status: ${response.status}`)
      }

      toast.success(`Image "${itemToDelete.name || itemToDelete.public_id}" deleted successfully.`)
      setMediaItems((prev) => prev.filter((item) => item.public_id !== itemToDelete.public_id))
      setSelectedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemToDelete.public_id)
        return newSet
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete image")
    } finally {
      setIsDeleting(null)
      setItemToDelete(null)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Image URL copied to clipboard!")
  }

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CldUploadButton
          options={{
            maxFiles: 10,
            folder: `${siteId}/uploads/`,
            cropping: true,
            tags: ["gallery_image", siteId, "user_upload"],
          }}
          onOpen={() => setIsUploading(true)}
          onUploadAdded={() => setIsUploading(true)}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          onClose={() => setIsUploading(false)}
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "esiln4yu"}
        >
          <Button disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Upload Images
          </Button>
        </CldUploadButton>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground" >
        <span>
          {filteredItems.length} of {mediaItems.length} images
        </span>
        {selectedItems.size > 0 && <Badge variant="secondary">{selectedItems.size} selected</Badge>}
      </div>

      {/* Media Grid/List */}
      {
        filteredItems.length === 0 ? (
          <ScrollArea>
            <div className="flex max-h-screen overflow-auto flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No images match your search." : "Upload your first image to get started."}
              </p>
              {!searchTerm && (
                <CldUploadButton
                  options={{
                    maxFiles: 10,
                    folder: `${siteId}/uploads/`,
                    cropping: true,
                    tags: ["gallery_image", siteId, "user_upload"],
                  }}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "esiln4yu"}
                >
                  <Button>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </CldUploadButton>
              )}
            </div>
          </ScrollArea>
        ) : viewMode === "grid" ? (
          <ScrollArea>
            <div className="grid max-h-screen grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.public_id} className="group p-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <NextImage
                        src={item.url}
                        alt={item.alt || item.name || "Image"}
                        fill
                        className="object-cover transition-transform "
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadImage(item.url, item.name || "image")}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(item)}
                              className="text-destructive"
                              disabled={isDeleting === item.public_id}
                            >
                              {isDeleting === item.public_id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate" title={item.name || item.public_id}>
                        {item.name || item.public_id}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>{formatFileSize(item.size)}</span>
                        <span>
                          {item.width} × {item.height}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Card key={item.public_id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <NextImage src={item.url} alt={item.alt || item.name || "Image"} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" title={item.name || item.public_id}>
                        {item.name || item.public_id}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{formatFileSize(item.size)}</span>
                        <span>
                          {item.width} × {item.height}
                        </span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadImage(item.url, item.name || "image")}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(item)}
                          className="text-destructive"
                          disabled={isDeleting === item.public_id}
                        >
                          {isDeleting === item.public_id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name || itemToDelete?.public_id}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)} className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white cursor-pointer hover:text-gray-300 hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}
