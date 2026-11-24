"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { flattenFolderPaths } from "@/components/MediaGallery/media-folder-tree"
import type { Media, MediaFolderNode } from "@/types/media-gallery"

interface MediaMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  item: Media | null
  folders: MediaFolderNode[]
  onMoved: (result: { public_id: string; url: string; folder: string }) => void
}

export function MediaMoveDialog({
  open,
  onOpenChange,
  siteId,
  item,
  folders,
  onMoved,
}: MediaMoveDialogProps) {
  const options = flattenFolderPaths(folders)
  const currentFolder = item?.folder || (item?.public_id ? item.public_id.split("/").slice(0, -1).join("/") : "")
  const [target, setTarget] = useState("")
  const [busy, setBusy] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (!next) setTarget("")
    onOpenChange(next)
  }

  const handleMove = async () => {
    if (!item?.public_id || !target) {
      toast.error("Choose a destination folder")
      return
    }
    if (target === currentFolder) {
      toast.error("Asset is already in that folder")
      return
    }

    setBusy(true)
    try {
      const response = await fetch(`/api/team/${siteId}/media-gallery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: item.public_id, to_folder: target }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to move asset")
      }
      toast.success("Asset moved. Existing page URLs may still point to the old link.")
      onMoved({
        public_id: data.public_id,
        url: data.url,
        folder: data.folder,
      })
      handleOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move asset")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
          <DialogDescription>
            Moving changes the Cloudinary path. Links that use the old URL may break.
          </DialogDescription>
        </DialogHeader>
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create a folder first, then move assets into it.
          </p>
        ) : (
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger>
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.path} value={opt.path} disabled={opt.path === currentFolder}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={busy || !target || options.length === 0}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
