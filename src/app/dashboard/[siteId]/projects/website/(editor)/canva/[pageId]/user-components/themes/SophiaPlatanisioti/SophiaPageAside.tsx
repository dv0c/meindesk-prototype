"use client"

import { useEditorContent } from "@/hooks/useEditorContent"
import { defineBlock } from "@/lib/block-api"
import { sanitizeRichHtml } from "@/lib/security/sanitize-html"
import { cn } from "@/lib/utils"
import { useNode } from "@craftjs/core"
import { PanelLeft } from "lucide-react"
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
        <PropertyRow label="Image URL">
          <PropertyInput
            value={imageSrc || ""}
            onChange={(val) => setProp((props: SophiaPageAsideProps) => (props.imageSrc = val))}
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
