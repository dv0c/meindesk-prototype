export interface Media {
  id: string
  name: string
  url: string
  alt?: string | null // Make alt optional
  type: string // e.g., 'image/jpeg', 'image/png'
  size: number // in bytes
  width?: number
  height?: number
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  siteId: string
  public_id?: string
  userId?: string // If you track which user uploaded it
}

export interface MediaGalleryResponse {
  media: Media[]
  totalPages: number
  currentPage: number
}

export interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
  // any other relevant fields Cloudinary or your upload service returns
}
