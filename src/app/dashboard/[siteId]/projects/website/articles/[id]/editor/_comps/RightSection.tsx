'use client'

import { useSite } from "@/components/Contexts/site-id-context"
import MediaLibraryDialog from "@/components/MediaGallery/media-select"
import { Empty, EmptyContent, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Article } from "@prisma/client"
import { Upload } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const RightSection = ({
  article,
  slug,
  setSlug,
  excerpt,
  setExcerpt,
  setThumbnail, thumbnail
}: {
  article: Article
  slug: string
  setSlug: (val: string) => void
  excerpt: string
  setExcerpt: (val: string) => void
  setThumbnail: (val: string) => void
  thumbnail: string;
}) => {
  const { siteId } = useSite()
  const [isOpen, setOpen] = useState<boolean>()
  if (!siteId) return null
  return (
    <>
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <h4 className="font-semibold">Slug</h4>
            <p className="text-accent">(Select a slug for this article)</p>
          </div>
          <Input placeholder="" value={slug || ""} onChange={e => setSlug(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <h4 className="font-semibold">Excerpt</h4>
            <p className="text-accent text-sm">(Add a short excerpt to summarize this article)</p>
          </div>
          <Textarea placeholder="" value={excerpt || ""} onChange={e => setExcerpt(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <h4 className="font-semibold">Thumbnail</h4>
            <p className="text-accent text-sm">(Add a cover to this article)</p>
          </div>
          {thumbnail == "" ? <div className="max-w-full h-[200px] cursor-pointer border-3 border-dotted">
            <Empty onClick={() => setOpen(true)}>
              <EmptyTitle>
                <Upload />
              </EmptyTitle>
              <EmptyContent>
                Click to upload an image.
              </EmptyContent>
            </Empty>
          </div> : (
            <div onClick={() => setOpen(true)} onContextMenu={(e) => { e.preventDefault(); setThumbnail(""); }} className="max-w-full h-[200px] relative">
              <Image src={thumbnail} alt="thumb" className="object-cover" fill />
              <div className="absolute cursor-pointer opacity-0 hover:opacity-100 backdrop-brightness-50 transition-all top-0 left-0 w-full h-full backdrop-blur-2xl">
                <Empty>
                  <EmptyTitle>
                    <Upload />
                  </EmptyTitle>
                  <EmptyContent>
                    Left click to upload an image.
                    Right click to remove it.
                  </EmptyContent>
                </Empty>
              </div>

            </div>
          )}
        </div>
      </div >
      <MediaLibraryDialog isOpen={!!isOpen} onClose={() => setOpen(!isOpen)} onSelect={(e) => setThumbnail(e[0].url)} siteId={siteId} />
    </>
  )
}

export default RightSection
