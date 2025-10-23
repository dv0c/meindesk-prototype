import { INSERT_IMAGE_COMMAND, InsertImagePayload } from "@/components/editor/plugins/images-plugin"
import { useState } from "react"
import MediaLibraryDialog from "./media-select"
import { useTeam } from "@/hooks/useTeam"
import { Spinner } from "../ui/spinner"

export function InsertImageGalleryDialogBody({
    activeEditor,
    siteId,
    onClose,
}: {
    activeEditor: any
    siteId: string
    onClose: () => void
}) {
    const [open, setOpen] = useState(true)
    const teamId = useTeam().team?.id

    const handleSelect = (items: { url: string; alt?: string }[]) => {
        items.forEach((item) => {
            activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: item.url,
                altText: item.alt || "",
            } as InsertImagePayload)
        })
        setOpen(false)
        onClose()
        
    }

    if (!teamId) return <div className="flex items-center justify-center h-12">
        <Spinner />
    </div>

    return (
        <MediaLibraryDialog
            siteId={teamId}
            isOpen={open}
            onClose={() => {
                setOpen(false)
                onClose()
            }}
            onSelect={handleSelect}
            multiSelect={true}
        />
    )
}
