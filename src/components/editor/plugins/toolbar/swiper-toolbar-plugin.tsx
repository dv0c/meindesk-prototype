import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useState } from "react"
import MediaLibraryDialog from "@/components/MediaGallery/media-select"
import { INSERT_SWIPER_COMMAND } from "@/components/editor/plugins/swiper-plugin"
import { useTeam } from "@/hooks/useTeam"

export function InsertSwiperButton() {
  const team = useTeam().team?.id
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const handleSelect = (items: { url: string; alt?: string }[]) => {
    editor.dispatchCommand(INSERT_SWIPER_COMMAND, items.map(i => ({ src: i.url, caption: i.alt })))
    setOpen(false)
  }

  if (!team) return null

  return (
    <>
      <button className="p-2 text-sm border rounded" onClick={() => setOpen(true)}>
        Swiper
      </button>
      <MediaLibraryDialog
        siteId={team}
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        multiSelect
      />
    </>
  )
}
