"use client"

import MediaLibraryDialog, { type MediaItem } from "@/components/MediaGallery/media-select"
import { Button } from "@/components/ui/button"
import { useEditorContent } from "@/hooks/useEditorContent"
import { defineBlock } from "@/lib/block-api"
import { sanitizeRichHtml } from "@/lib/security/sanitize-html"
import { cn } from "@/lib/utils"
import { useNode } from "@craftjs/core"
import { Home, ImageIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import {
  PropertyInput,
  PropertyRichText,
  PropertyRow,
  PropertySection,
} from "../../../components/PropertySection"

export interface SophiaHomepageProps {
  eyebrow?: string
  title?: string
  lead?: string
  thumbnail?: string
  htmlContent?: string
  className?: string
}

const defaultProps: SophiaHomepageProps = {
  eyebrow: "Καλώς ήρθατε",
  title: "Σοφία Πλατανησιώτη",
  lead: "Σύμβουλος Ψυχικής Υγείας — υποστήριξη με σεβασμό, κατανόηση και επαγγελματική φροντίδα.",
  thumbnail: "https://sophiaplatanisioti.gr/sophia-1.webp",
  htmlContent: "<p>Welcome content goes here.</p>",
}

const SophiaHomepageSettings = () => {
  const {
    actions: { setProp },
    eyebrow,
    title,
    lead,
    thumbnail,
    htmlContent,
  } = useNode((node) => ({
    eyebrow: node.data.props.eyebrow as string,
    title: node.data.props.title as string,
    lead: node.data.props.lead as string,
    thumbnail: node.data.props.thumbnail as string,
    htmlContent: node.data.props.htmlContent as string,
  }))

  const params = useParams()
  const siteId = params.siteId as string
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleMediaSelect = (items: MediaItem[]) => {
    if (items.length === 0) return
    setProp((props: SophiaHomepageProps) => {
      props.thumbnail = items[0].url
    })
  }

  return (
    <div className="space-y-4 pt-2">
      <PropertySection title="Page header" defaultOpen>
        <PropertyRow label="Eyebrow">
          <PropertyInput
            value={eyebrow || ""}
            onChange={(val) => setProp((props: SophiaHomepageProps) => (props.eyebrow = val))}
          />
        </PropertyRow>
        <PropertyRow label="Title">
          <PropertyInput
            value={title || ""}
            onChange={(val) => setProp((props: SophiaHomepageProps) => (props.title = val))}
          />
        </PropertyRow>
        <PropertyRow label="Lead">
          <PropertyInput
            value={lead || ""}
            onChange={(val) => setProp((props: SophiaHomepageProps) => (props.lead = val))}
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Portrait image" defaultOpen>
        <PropertyRow label="Media library">
          <div className="flex w-full flex-col gap-2">
            {thumbnail ? (
              <div className="group relative aspect-[380/460] w-full overflow-hidden rounded-md border border-border bg-muted">
                <img
                  src={thumbnail}
                  alt="Portrait preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Change image
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex h-10 w-full items-center justify-center gap-2 border-dashed"
                onClick={() => setIsDialogOpen(true)}
              >
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Select from library</span>
              </Button>
            )}
          </div>
        </PropertyRow>
        <PropertyRow label="Image URL">
          <PropertyInput
            value={thumbnail || ""}
            onChange={(val) => setProp((props: SophiaHomepageProps) => (props.thumbnail = val))}
            placeholder="https://..."
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Body" defaultOpen>
        <PropertyRichText
          label="HTML content"
          value={htmlContent || ""}
          onChange={(val) => setProp((props: SophiaHomepageProps) => (props.htmlContent = val))}
        />
      </PropertySection>

      <MediaLibraryDialog
        siteId={siteId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelect={handleMediaSelect}
        multiSelect={false}
      />
    </div>
  )
}

export function SophiaHomepageView({
  eyebrow = defaultProps.eyebrow,
  title = defaultProps.title,
  lead = defaultProps.lead,
  thumbnail = defaultProps.thumbnail,
  htmlContent = defaultProps.htmlContent,
  className,
}: SophiaHomepageProps) {
  const safeHtml = useEditorContent(htmlContent)

  return (
    <div className={cn("w-full py-8 sm:py-12", className)}>
      <div className="site-container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-2xl sm:mb-14">
          {eyebrow ? (
            <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
          ) : null}
          {lead ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {lead}
            </p>
          ) : null}
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-14">
          <div className="order-2 lg:order-1">
            {safeHtml ? (
              <div
                className="prose-sm homepage max-w-none text-muted-foreground prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(safeHtml) }}
              />
            ) : null}
          </div>

          {thumbnail ? (
            <figure className="order-1 lg:order-2">
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <img
                  src={thumbnail}
                  alt={title || "Σοφία Πλατανησιώτη"}
                  width={380}
                  height={460}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            </figure>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const SophiaHomepage = defineBlock<SophiaHomepageProps>({
  name: "SophiaHomepage",
  category: "Sophia Platanisioti",
  icon: <Home className="w-4 h-4" />,
  description: "Homepage: welcome header, prose left, portrait right",
  defaultProps,
  settings: SophiaHomepageSettings,
  render: SophiaHomepageView,
})