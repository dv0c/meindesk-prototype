"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

interface MediaGalleryClientProps {
  onSelect?: (url: string) => void
}

export function MediaGalleryClient({ onSelect }: MediaGalleryClientProps) {
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

  // --- Render Helpers ---

  const EmptyState = () => (
    <div className="flex max-h-[60vh] flex-col items-center justify-center py-20 text-center border border-dashed rounded-lg bg-muted/10 m-6">
      <div className="bg-muted/20 p-4 rounded-full mb-4">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium mb-1">No assets found</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        {searchTerm ? "Try adjusting your search terms." : "Upload your first image to get started."}
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
          <Button variant="outline" size="sm">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </CldUploadButton>
      )}
    </div>
  )

  const GridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6">
      {filteredItems.map((item) => (
        <div key={item.public_id} className="group relative flex flex-col gap-2">
          <div
            className={cn(
              "relative aspect-square w-full rounded-md border bg-muted/20 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md",
              onSelect && "cursor-pointer ring-offset-2 hover:ring-2 ring-primary/20"
            )}
            onClick={() => onSelect && onSelect(item.url)}
          >
            <NextImage
              src={item.url}
              alt={item.alt || item.name || "Image"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay Actions */}
            {!onSelect && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-6 w-6 shadow-sm">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(item.url, "_blank") }}>
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyToClipboard(item.url) }}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); downloadImage(item.url, item.name || "image") }}>
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(item) }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <div className="space-y-0.5 px-0.5">
            <p className="text-xs font-medium truncate select-all" title={item.name || item.public_id}>
              {item.name || item.public_id}
            </p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wide">
              <span>{item.format}</span>
              <span>{formatFileSize(item.size)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="p-6">
      <div className="rounded-md border bg-background text-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-[100px]">Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.public_id} className="group border-b last:border-0 hover:bg-muted/40">
                <TableCell className="py-2">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted border">
                    <NextImage src={item.url} alt={item.name || "Image"} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <span className="truncate max-w-[200px] block" title={item.name || item.public_id}>
                    {item.name || item.public_id}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {item.width} x {item.height}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {formatFileSize(item.size)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(item.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(item.url)}>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex max-w-7xl mx-auto h-full w-full flex-col bg-background/50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center border rounded-md bg-muted/20 p-0.5 ml-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-sm"
              onClick={() => setViewMode("list")}
            >
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
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "prototype"}
          className="w-auto"
        >
          <Button disabled={isUploading} size="sm" className="h-9">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload
          </Button>
        </CldUploadButton>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {filteredItems.length === 0 ? (
          <EmptyState />
        ) : viewMode === "grid" ? (
          <GridView />
        ) : (
          <ListView />
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
