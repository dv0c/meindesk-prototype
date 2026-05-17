"use client"

import MediaLibraryDialog, { type MediaItem } from "@/components/MediaGallery/media-select"
import { Button } from "@/components/ui/button"
import { useEditorContent } from "@/hooks/useEditorContent"
import { defineBlock } from "@/lib/block-api"
import { sanitizeRichHtml } from "@/lib/security/sanitize-html"
import { cn } from "@/lib/utils"
import { useNode } from "@craftjs/core"
import { ImageIcon, PanelLeft } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import {
  PropertyInput,
  PropertyRichText,
  PropertyRow,
  PropertySection,
} from "../../../components/PropertySection"

export interface SophiaPageAsideProps {
  eyebrow?: string
  title?: string
  lead?: string
  imageSrc?: string
  imageAlt?: string
  htmlContent?: string
  className?: string
}

const defaultProps: SophiaPageAsideProps = {
  eyebrow: "Τι προσφέρω",
  title: "Υπηρεσίες",
  lead: "",
  imageSrc: "https://sophiaplatanisioti.gr/SIMA_1-02%20.webp",
  imageAlt: "Υπηρεσίες",
  htmlContent: "<p>Page content goes here.</p>",
}

const SophiaPageAsideSettings = () => {
  const {
    actions: { setProp },
    eyebrow,
    title,
    lead,
    imageSrc,
    imageAlt,
    htmlContent,
  } = useNode((node) => ({
    eyebrow: node.data.props.eyebrow as string,
    title: node.data.props.title as string,
    lead: node.data.props.lead as string,
    imageSrc: node.data.props.imageSrc as string,
    imageAlt: node.data.props.imageAlt as string,
    htmlContent: node.data.props.htmlContent as string,
  }))

  const params = useParams()
  const siteId = params.siteId as string
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleMediaSelect = (items: MediaItem[]) => {
    if (items.length === 0) return
    const selected = items[0]
    setProp((props: SophiaPageAsideProps) => {
      props.imageSrc = selected.url
      if (selected.alt?.trim()) {
        props.imageAlt = selected.alt.trim()
      } else if (selected.name?.trim()) {
        props.imageAlt = selected.name.trim()
      }
    })
  }

  return (
    <div className="space-y-4 pt-2">
      <PropertySection title="Page header" defaultOpen>
        <PropertyRow label="Eyebrow">
          <PropertyInput
            value={eyebrow || ""}
            onChange={(val) => setProp((props: SophiaPageAsideProps) => (props.eyebrow = val))}
          />
        </PropertyRow>
        <PropertyRow label="Title">
          <PropertyInput
            value={title || ""}
            onChange={(val) => setProp((props: SophiaPageAsideProps) => (props.title = val))}
          />
        </PropertyRow>
        <PropertyRow label="Lead">
          <PropertyInput
            value={lead || ""}
            onChange={(val) => setProp((props: SophiaPageAsideProps) => (props.lead = val))}
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Aside image" defaultOpen>
        <PropertyRow label="Media library">
          <div className="flex w-full flex-col gap-2">
            {imageSrc ? (
              <div className="group relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
                <img
                  src={imageSrc}
                  alt={imageAlt || "Preview"}
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
            value={imageSrc || ""}
            onChange={(val) => setProp((props: SophiaPageAsideProps) => (props.imageSrc = val))}
            placeholder="https://..."
          />
        </PropertyRow>
        <PropertyRow label="Image alt">
          <PropertyInput
            value={imageAlt || ""}
            onChange={(val) => setProp((props: SophiaPageAsideProps) => (props.imageAlt = val))}
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Body" defaultOpen>
        <PropertyRichText
          label="HTML content"
          value={htmlContent || ""}
          onChange={(val) => setProp((props: SophiaPageAsideProps) => (props.htmlContent = val))}
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

export function SophiaPageAsideView({
  eyebrow = defaultProps.eyebrow,
  title = defaultProps.title,
  lead = defaultProps.lead,
  imageSrc = defaultProps.imageSrc,
  imageAlt = defaultProps.imageAlt,
  htmlContent = defaultProps.htmlContent,
  className,
}: SophiaPageAsideProps) {
  const safeHtml = useEditorContent(htmlContent)

  return (
    <div className={cn("w-full py-8 sm:py-12", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14">
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

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:gap-14">
          {imageSrc ? (
            <figure className="overflow-hidden rounded-lg border border-border bg-card">
              <img
                src={imageSrc}
                alt={imageAlt || title || "Page image"}
                width={440}
                height={440}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </figure>
          ) : null}

          {safeHtml ? (
            <div
              className="prose-sm ypyresies max-w-none text-muted-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:leading-relaxed prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(safeHtml) }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const SophiaPageAside = defineBlock<SophiaPageAsideProps>({
  name: "SophiaPageAside",
  category: "Sophia Platanisioti",
  icon: <PanelLeft className="w-4 h-4" />,
  description: "Services-style page: header, side image, rich HTML body",
  defaultProps,
  settings: SophiaPageAsideSettings,
  render: SophiaPageAsideView,
})
