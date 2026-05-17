export interface CropAreaPixels {
  x: number
  y: number
  width: number
  height: number
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (e) => reject(e))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: CropAreaPixels,
  maxWidth?: number,
  mimeType: string = "image/jpeg",
  quality: number = 0.92,
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  let outputWidth = pixelCrop.width
  let outputHeight = pixelCrop.height

  if (maxWidth && outputWidth > maxWidth) {
    const scale = maxWidth / outputWidth
    outputWidth = maxWidth
    outputHeight = Math.round(outputHeight * scale)
  }

  canvas.width = outputWidth
  canvas.height = outputHeight

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed"))
          return
        }
        resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

export async function uploadCroppedImage(
  siteId: string,
  blob: Blob,
  options?: { replacePublicId?: string; filename?: string },
): Promise<{
  secure_url: string
  public_id: string
  width?: number
  height?: number
  bytes?: number
}> {
  const formData = new FormData()
  formData.append("file", blob, options?.filename || "cropped.jpg")
  if (options?.replacePublicId) {
    formData.append("replacePublicId", options.replacePublicId)
  }

  const response = await fetch(`/api/team/${siteId}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || "Failed to upload edited image")
  }

  return response.json()
}
