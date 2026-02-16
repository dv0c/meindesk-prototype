import { useEditor, useNode } from "@craftjs/core"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useSite } from "@/components/Contexts/site-id-context"
import MediaLibraryDialog, { MediaItem } from "@/components/MediaGallery/media-select"

export interface CraftComponentProps {
  marginTop?: number | string
  marginRight?: number | string
  marginBottom?: number | string
  marginLeft?: number | string
  paddingTop?: number | string
  paddingRight?: number | string
  paddingBottom?: number | string
  paddingLeft?: number | string
  width?: string | number
  height?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  minHeight?: string | number
  backgroundColor?: string
  color?: string
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  borderStyle?: "solid" | "dashed" | "dotted" | "none"
  display?: "block" | "flex" | "grid" | "inline-block" | "none"
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse"
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline"
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly"
  gap?: number | string
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  fontSize?: number | string
  fontWeight?: string | number
  fontFamily?: string
  lineHeight?: number | string
  letterSpacing?: number | string
  textAlign?: "left" | "center" | "right" | "justify"
  textDecoration?: "none" | "underline" | "line-through" | "overline"
  boxShadow?: string
  opacity?: number
  overflow?: "visible" | "hidden" | "scroll" | "auto"
  className?: string
  style?: React.CSSProperties
  responsive?: {
    hiddenOn?: Array<"desktop" | "tablet" | "mobile">
  }
}

function toCssValue(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined
  if (typeof value === "number") return `${value}px`
  return value
}

export function propsToStyle(props: CraftComponentProps): React.CSSProperties {
  const style: React.CSSProperties = { ...props.style }
  if (props.marginTop !== undefined) style.marginTop = toCssValue(props.marginTop)
  if (props.marginRight !== undefined) style.marginRight = toCssValue(props.marginRight)
  if (props.marginBottom !== undefined) style.marginBottom = toCssValue(props.marginBottom)
  if (props.marginLeft !== undefined) style.marginLeft = toCssValue(props.marginLeft)
  if (props.paddingTop !== undefined) style.paddingTop = toCssValue(props.paddingTop)
  if (props.paddingRight !== undefined) style.paddingRight = toCssValue(props.paddingRight)
  if (props.paddingBottom !== undefined) style.paddingBottom = toCssValue(props.paddingBottom)
  if (props.paddingLeft !== undefined) style.paddingLeft = toCssValue(props.paddingLeft)
  if (props.width !== undefined) style.width = toCssValue(props.width)
  if (props.height !== undefined) style.height = toCssValue(props.height)
  if (props.minWidth !== undefined) style.minWidth = toCssValue(props.minWidth)
  if (props.maxWidth !== undefined) style.maxWidth = toCssValue(props.maxWidth)
  if (props.minHeight !== undefined) style.minHeight = toCssValue(props.minHeight)
  if (props.backgroundColor) style.backgroundColor = props.backgroundColor
  if (props.color) style.color = props.color
  if (props.display) style.display = props.display
  if (props.flexDirection) style.flexDirection = props.flexDirection
  if (props.alignItems) style.alignItems = props.alignItems
  if (props.justifyContent) style.justifyContent = props.justifyContent
  if (props.gap !== undefined) style.gap = toCssValue(props.gap)
  if (props.flexWrap) style.flexWrap = props.flexWrap
  if (props.fontSize !== undefined) style.fontSize = toCssValue(props.fontSize)
  if (props.fontWeight !== undefined) style.fontWeight = props.fontWeight
  if (props.fontFamily) style.fontFamily = props.fontFamily
  if (props.lineHeight !== undefined) style.lineHeight = toCssValue(props.lineHeight)
  if (props.letterSpacing !== undefined) style.letterSpacing = toCssValue(props.letterSpacing)
  if (props.textAlign) style.textAlign = props.textAlign
  if (props.textDecoration) style.textDecoration = props.textDecoration
  if (props.boxShadow) style.boxShadow = props.boxShadow
  if (props.opacity !== undefined) style.opacity = props.opacity
  if (props.overflow) style.overflow = props.overflow
  if (props.borderRadius !== undefined) style.borderRadius = toCssValue(props.borderRadius)
  if (props.borderWidth !== undefined) {
    style.borderWidth = toCssValue(props.borderWidth)
    style.borderStyle = props.borderStyle || "solid"
    if (props.borderColor) style.borderColor = props.borderColor
  }
  return style
}

type TextElementType =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "p" | "span" | "div" | "label"
  | "strong" | "em" | "b" | "i" | "u" | "s"
  | "small" | "mark" | "sub" | "sup"
  | "blockquote" | "q" | "cite"
  | "a" | "li"

interface EditableTextProps {
  propName: string
  value: string
  as?: TextElementType
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  renderValue?: string
}

export function EditableText({
  propName,
  value,
  as: Tag = "span",
  className,
  style,
  children,
  renderValue,
}: EditableTextProps) {
  const {
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }))
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))

  const [isEditing, setIsEditing] = useState(false)
  const contentRef = useRef<HTMLElement>(null)

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!enabled) return
    e.stopPropagation()
    if (selected) setIsEditing(true)
  }, [enabled, selected])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (contentRef.current) {
      const newText = contentRef.current.innerText.trim()
      if (newText && newText !== value) {
        setProp((props: Record<string, any>) => {
          props[propName] = newText
        })
      }
    }
  }, [setProp, propName, value])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      contentRef.current?.blur()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      if (contentRef.current) contentRef.current.innerText = value || ""
    }
  }, [value])

  useEffect(() => {
    if (!selected && isEditing) setIsEditing(false)
  }, [selected, isEditing])

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus()
      setTimeout(() => {
        if (!contentRef.current) return
        const range = document.createRange()
        range.selectNodeContents(contentRef.current)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }, 0)
    }
  }, [isEditing])

  const content = isEditing ? value : (renderValue ?? value)
  return (
    <Tag
      ref={contentRef as any}
      className={className}
      style={{ ...style, outline: isEditing ? "none" : undefined, cursor: enabled ? (isEditing ? "text" : "pointer") : undefined }}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {children ?? content}
    </Tag>
  )
}

interface EditableImageProps {
  propName: string
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  width?: number | string
  height?: number | string
}

export function EditableImage({
  propName,
  src,
  alt = "Image",
  className,
  style,
  width,
  height,
}: EditableImageProps) {
  const {
    selected,
    actions: { setProp },
  } = useNode((state) => ({ selected: state.events.selected }))
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
  const { siteId } = useSite()
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!enabled) return
    e.stopPropagation()
    if (selected) setIsMediaPickerOpen(true)
  }, [enabled, selected])

  const handleMediaSelect = useCallback((items: MediaItem[]) => {
    if (items.length > 0) {
      setProp((props: Record<string, any>) => {
        props[propName] = items[0].url
      })
    }
    setIsMediaPickerOpen(false)
  }, [setProp, propName])

  return (
    <>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ ...style, cursor: enabled && selected ? "pointer" : undefined }}
        onClick={handleClick}
      />
      {siteId && (
        <MediaLibraryDialog
          siteId={siteId}
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleMediaSelect}
          multiSelect={false}
        />
      )}
    </>
  )
}
