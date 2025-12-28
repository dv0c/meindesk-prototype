import { MediaGalleryClient } from "@/components/MediaGallery/media-gallery-client"

export const metadata = {
  title: "Media Gallery | PROTOTYPE — Blog Builder & Drag-Drop CMS",
}

const page = () => {
  return <div className="px-5">
    <MediaGalleryClient />
  </div>
}

export default page