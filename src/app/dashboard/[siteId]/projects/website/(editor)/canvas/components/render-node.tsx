"use client"

import type React from "react"
import dynamic from "next/dynamic"
import type { LayoutNode } from "@/lib/types"
import { Suspense } from "react"
import { DraggableWrapper } from "./editor/draggable-wrapper"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface RenderNodeProps {
  node: LayoutNode
  isEditor?: boolean
  onSelect?: (id: string) => void
  isSelected?: boolean
  onContextMenu?: (e: React.MouseEvent, id: string) => void
}

const componentMap: Record<string, React.ComponentType<any>> = {
  Container: dynamic(() => import("./ui/editor/Container")),
  Grid: dynamic(() => import("./ui/editor/Grid")),
  HtmlContainer: dynamic(() => import("./ui/editor/HtmlContainer")),
  EditorButton: dynamic(() => import("./ui/editor/EditorButton")),
  Slideshow: dynamic(() => import("./ui/editor/Slideshow")),
  ArticleList: dynamic(() => import("./ui/editor/ArticleList")),
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

  const renderedChildren = node.children ? (
    <SortableContext items={node.children.map((child) => child.id)} strategy={verticalListSortingStrategy}>
      {node.children.map((child) => (
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
  ) : null

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
        data={{
          type: "component",
          isContainer: !!node.children,
          component: node,
        }}
      >
        {content}
      </DraggableWrapper>
    )
  }

  return <div data-node-id={node.id}>{content}</div>
}
