"use client"

import type { LayoutNode } from "@/lib/types"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import dynamic from "next/dynamic"
import type React from "react"
import { Suspense } from "react"
import { DraggableWrapper } from "./editor/draggable-wrapper"

interface RenderNodeProps {
  node: LayoutNode
  isEditor?: boolean
  onSelect?: (id: string) => void
  isSelected?: boolean
  onContextMenu?: (e: React.MouseEvent, id: string) => void
}

// Dynamic component map
const componentMap: Record<string, React.ComponentType<any>> = {
  Container: dynamic(() => import("./ui/editor/Container")),
  Grid: dynamic(() => import("./ui/editor/Grid")),
  Button: dynamic(() => import("./ui/editor/Button")),
  Slideshow: dynamic(() => import("./ui/editor/Slideshow")),
  Articles: dynamic(() => import("./ui/editor/Articles")),
  Hero: dynamic(() => import("./ui/editor/Hero")),
  Heading: dynamic(() => import("./ui/editor/Heading")),
  Text: dynamic(() => import("./ui/editor/Text")),
  Features: dynamic(() => import("./ui/editor/Features")),
  CallToAction: dynamic(() => import("./ui/editor/CallToAction")),
  Testimonial: dynamic(() => import("./ui/editor/Testimonial")),
  Pricing: dynamic(() => import("./ui/editor/Pricing")),
  Image: dynamic(() => import("./ui/editor/Image")),
  Spacer: dynamic(() => import("./ui/editor/Spacer")),
  Divider: dynamic(() => import("./ui/editor/Divider")),
  Footer: dynamic(() => import("./ui/editor/Footer")),
  Newsletter: dynamic(() =>
    import("./ui/editor/Newsletter").then(mod => ({ default: mod.Newsletter }))
  ),
  Stats: dynamic(() =>
    import("./ui/editor/Stats").then(mod => ({ default: mod.Stats }))
  ),
  TeamMember: dynamic(() =>
    import("./ui/editor/TeamMember").then(mod => ({ default: mod.TeamMember }))
  ),
  Tabs: dynamic(() =>
    import("./ui/editor/Tabs").then(mod => ({ default: mod.Tabs }))
  ),
  Navbar: dynamic(() => import("./ui/editor/Navbar")),
  Navbar2: dynamic(() => import("@/components/Builder/CustomBlocks/Navbar")),
  SingleArticle: dynamic(() => import("@/components/Builder/CustomBlocks/SingleArticle").then(mod => ({ default: mod.SingleArticle }))),
  Badge: dynamic(() => import("@/components/Builder/CustomBlocks/Badge")),
  Avatar: dynamic(() => import("@/components/Builder/CustomBlocks/Avatar")),
  Input: dynamic(() => import("@/components/Builder/CustomBlocks/Input")),
  Textarea: dynamic(() => import("@/components/Builder/CustomBlocks/Textarea")),
  Select: dynamic(() => import("@/components/Builder/CustomBlocks/Select")),
  Checkbox: dynamic(() => import("@/components/Builder/CustomBlocks/Checkbox")),
  Switch: dynamic(() => import("@/components/Builder/CustomBlocks/Switch")),
  Slider: dynamic(() => import("@/components/Builder/CustomBlocks/Slider")),
  Progress: dynamic(() => import("@/components/Builder/CustomBlocks/Progress")),
  Separator: dynamic(() => import("@/components/Builder/CustomBlocks/Separator")),
  Skeleton: dynamic(() => import("@/components/Builder/CustomBlocks/Skeleton")),
  Spinner: dynamic(() => import("@/components/Builder/CustomBlocks/Spinner")),
  Table: dynamic(() => import("@/components/Builder/CustomBlocks/Table")),
  Breadcrumb: dynamic(() => import("@/components/Builder/CustomBlocks/Breadcrumb")),
  Kbd: dynamic(() => import("@/components/Builder/CustomBlocks/Kbd")),
  Alert: dynamic(() => import("@/components/Builder/CustomBlocks/Alert").then((mod) => ({ default: mod.Alert }))),


}

export function RenderNode({ node, isEditor = false, onSelect, isSelected = false, onContextMenu }: RenderNodeProps) {
  const Component = componentMap[node.type]

  if (!Component) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
        <p className="text-sm text-destructive">Component "{node.type}" not found</p>
      </div>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isEditor && onSelect) {
      e.stopPropagation()
      onSelect(node.id)
    }

    if (!isEditor && node.script) {
      try {
        // Safe-ish execution
        new Function(node.script)()
      } catch (err) {
        console.error("Error executing script for node", node.id, err)
      }
    }
  }

  const CustomStyle = node.customCss ? (
    <style
      dangerouslySetInnerHTML={{
        __html: node.customCss.replace(/selector/g, `[data-node-id="${node.id}"]`),
      }}
    />
  ) : null

  const allowsChildren = node.children !== undefined
  const hasChildren = node.children && node.children.length > 0

  const renderedChildren = hasChildren ? (
    node.type === "Slideshow" && node.children ? (
      node.children.map((child) => (
        <RenderNode
          key={child.id}
          node={child}
          isEditor={isEditor}
          onSelect={onSelect}
          isSelected={isSelected}
          onContextMenu={onContextMenu}
        />
      ))
    ) : node.type === "Grid" ? (
      node.children?.map((child) => (
        <RenderNode
          key={child.id}
          node={child}
          isEditor={isEditor}
          onSelect={onSelect}
          isSelected={isSelected}
          onContextMenu={onContextMenu}
        />
      ))
    ) : (
      <SortableContext items={node.children?.map((child) => child.id)} strategy={verticalListSortingStrategy}>
        {node.children?.map((child) => (
          <RenderNode
            key={child.id}
            node={child}
            isEditor={isEditor}
            onSelect={onSelect}
            isSelected={isSelected}
            onContextMenu={onContextMenu}
          />
        ))}
      </SortableContext>
    )
  ) : // Show drop indicator for empty containers in editor mode
    isEditor && allowsChildren ? (
      <div className="min-h-[60px] rounded-md border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground">
        Drop components here
      </div>
    ) : undefined

  const content = (
    <>
      {CustomStyle}
      <Suspense
        fallback={
          <div className="p-4 border border-muted bg-muted/50 rounded-md animate-pulse">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <Component
          {...node.props}
          className={`${node.props.className || ""} ${node.className || ""}`}
          style={node.style}
          onClick={handleClick}
          data-node-id={node.id}
          data-editor-mode={isEditor}
        >
          {renderedChildren}
        </Component>
      </Suspense>
    </>
  )

  if (isEditor) {
    return (
      <DraggableWrapper
        id={node.id}
        isSelected={isSelected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        isContainer={allowsChildren}
        data={{
          type: "component",
          isContainer: allowsChildren,
          component: node,
        }}
      >
        {content}
      </DraggableWrapper>
    )
  }

  return <div data-node-id={node.id}>{content}</div>
}
