'use client'

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Article } from "@prisma/client"

const RightSection = ({
  article,
  slug,
  setSlug,
  excerpt,
  setExcerpt
}: {
  article: Article
  slug: string
  setSlug: (val: string) => void
  excerpt: string
  setExcerpt: (val: string) => void
}) => {
    return (
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
      </div>
    )
}

export default RightSection
