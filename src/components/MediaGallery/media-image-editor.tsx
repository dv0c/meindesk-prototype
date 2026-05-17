"use client"

import { useCallback, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Loader2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCroppedImageBlob, uploadCroppedImage } from "@/lib/media-image-crop"

const ASPECT_PRESETS = [
  { label: "Free", value: "free" },
  { label: "1:1", value: "1" },
  { label: "4:3", value: "4/3" },
  { label: "16:9", value: "16/9" },
  { label: "OG (1.91:1)", value: "1.91" },
] as const

const MAX_WIDTH_PRESETS = [
  { label: "Original", value: "0" },
  { label: "1920px", value: "1920" },
  { label: "1200px", value: "1200" },
  { label: "800px", value: "800" },
]

function parseAspect(value: string): number | undefined {
  if (value === "free") return undefined
  if (value === "4/3") return 4 / 3
  if (value === "16/9") return 16 / 9
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : undefined
}

function aspectToPresetValue(ratio?: number): string {
  if (ratio === undefined) return "free"
  if (Math.abs(ratio - 1) < 0.01) return "1"
  if (Math.abs(ratio - 4 / 3) < 0.01) return "4/3"
  if (Math.abs(ratio - 16 / 9) < 0.01) return "16/9"
  if (Math.abs(ratio - 1.91) < 0.05) return "1.91"
  return "free"
}

export interface MediaImageEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  publicId?: string
  siteId: string
  defaultAspectRatio?: number
  onComplete: (result: { url: string; public_id?: string }) => void
}

export function MediaImageEditor({
  open,
  onOpenChange,
  imageUrl,
  publicId,
  siteId,
  defaultAspectRatio,
  onComplete,
}: MediaImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspectPreset, setAspectPreset] = useState(() => aspectToPresetValue(defaultAspectRatio))
  const [maxWidth, setMaxWidth] = useState("1200")
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMode, setSaveMode] = useState<"new" | "replace" | null>(null)

  const aspect = parseAspect(aspectPreset)

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleSave = async (mode: "new" | "replace") => {
    if (!croppedAreaPixels) {
      toast.error("Adjust the crop area first")
      return
    }

    if (mode === "replace" && !publicId) {
      toast.error("Cannot replace: missing image identifier")
      return
    }

    setIsSaving(true)
    setSaveMode(mode)

    try {
      const maxW = maxWidth === "0" ? undefined : Number.parseInt(maxWidth, 10)
      const blob = await getCroppedImageBlob(imageUrl, croppedAreaPixels, maxW)

      const result = await uploadCroppedImage(siteId, blob, {
        replacePublicId: mode === "replace" ? publicId : undefined,
        filename: `${publicId?.split("/").pop() || "image"}-edited.jpg`,
      })

      onComplete({
        url: result.secure_url,
        public_id: result.public_id,
      })
      onOpenChange(false)
      toast.success(mode === "replace" ? "Image replaced successfully" : "Image saved as new")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save image")
    } finally {
      setIsSaving(false)
      setSaveMode(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl w-full flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Edit image</DialogTitle>
          <DialogDescription>Crop and resize, then save as a new file or replace the original.</DialogDescription>
        </DialogHeader>

        <div className="relative h-[min(50vh,400px)] w-full bg-muted">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-6 py-4 space-y-4 border-t">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Aspect ratio</Label>
              <Select value={aspectPreset} onValueChange={setAspectPreset}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Max output width</Label>
              <Select value={maxWidth} onValueChange={setMaxWidth}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_WIDTH_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Zoom</Label>
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSave("new")}
            disabled={isSaving}
          >
            {isSaving && saveMode === "new" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save as new
          </Button>
          <Button
            onClick={() => handleSave("replace")}
            disabled={isSaving || !publicId}
            title={!publicId ? "Replace requires a library asset" : undefined}
          >
            {isSaving && saveMode === "replace" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Replace original
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
