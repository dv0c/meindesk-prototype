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
  Container: dynamic(() => import("./ui/editor/Container"), { ssr: false }),
  Grid: dynamic(() => import("./ui/editor/Grid"), { ssr: false }),
  Button: dynamic(() => import("./ui/editor/Button"), { ssr: false }),
  Slideshow: dynamic(() => import("./ui/editor/Slideshow"), { ssr: false }),
  Articles: dynamic(() => import("./ui/editor/Articles"), { ssr: false }),
  Hero: dynamic(() => import("./ui/editor/Hero"), { ssr: false }),
  Heading: dynamic(() => import("./ui/editor/Heading"), { ssr: false }),
  Text: dynamic(() => import("./ui/editor/Text"), { ssr: false }),
  Features: dynamic(() => import("./ui/editor/Features"), { ssr: false }),
  CallToAction: dynamic(() => import("./ui/editor/CallToAction"), { ssr: false }),
  Testimonial: dynamic(() => import("./ui/editor/Testimonial"), { ssr: false }),
  Pricing: dynamic(() => import("./ui/editor/Pricing"), { ssr: false }),
  Image: dynamic(() => import("./ui/editor/Image"), { ssr: false }),
  Spacer: dynamic(() => import("./ui/editor/Spacer"), { ssr: false }),
  Divider: dynamic(() => import("./ui/editor/Divider"), { ssr: false }),
  Footer: dynamic(() => import("./ui/editor/Footer"), { ssr: false }),
  Newsletter: dynamic(() => import("./ui/editor/Newsletter").then(m => ({ default: m.Newsletter })), { ssr: false }),
  Stats: dynamic(() => import("./ui/editor/Stats").then(m => ({ default: m.Stats })), { ssr: false }),
  TeamMember: dynamic(() => import("./ui/editor/TeamMember").then(m => ({ default: m.TeamMember })), { ssr: false }),
  Tabs: dynamic(() => import("./ui/editor/Tabs").then(m => ({ default: m.Tabs })), { ssr: false }),
  Navbar: dynamic(() => import("./ui/editor/Navbar"), { ssr: false }),
  Navbar2: dynamic(() => import("@/components/Builder/CustomBlocks/Navbar"), { ssr: false }),
  SingleArticle: dynamic(() => import("@/components/Builder/CustomBlocks/SingleArticle").then(m => ({ default: m.SingleArticle })), { ssr: false }),
  Badge: dynamic(() => import("@/components/Builder/CustomBlocks/Badge"), { ssr: false }),
  Avatar: dynamic(() => import("@/components/Builder/CustomBlocks/Avatar"), { ssr: false }),
  Input: dynamic(() => import("@/components/Builder/CustomBlocks/Input"), { ssr: false }),
  Textarea: dynamic(() => import("@/components/Builder/CustomBlocks/Textarea"), { ssr: false }),
  Select: dynamic(() => import("@/components/Builder/CustomBlocks/Select"), { ssr: false }),
  Checkbox: dynamic(() => import("@/components/Builder/CustomBlocks/Checkbox"), { ssr: false }),
  Switch: dynamic(() => import("@/components/Builder/CustomBlocks/Switch"), { ssr: false }),
  Slider: dynamic(() => import("@/components/Builder/CustomBlocks/Slider"), { ssr: false }),
  Progress: dynamic(() => import("@/components/Builder/CustomBlocks/Progress"), { ssr: false }),
  Separator: dynamic(() => import("@/components/Builder/CustomBlocks/Separator"), { ssr: false }),
  Skeleton: dynamic(() => import("@/components/Builder/CustomBlocks/Skeleton"), { ssr: false }),
  Spinner: dynamic(() => import("@/components/Builder/CustomBlocks/Spinner"), { ssr: false }),
  Table: dynamic(() => import("@/components/Builder/CustomBlocks/Table"), { ssr: false }),
  Breadcrumb: dynamic(() => import("@/components/Builder/CustomBlocks/Breadcrumb"), { ssr: false }),
  Kbd: dynamic(() => import("@/components/Builder/CustomBlocks/Kbd"), { ssr: false }),
  Alert: dynamic(() => import("@/components/Builder/CustomBlocks/Alert").then(m => ({ default: m.Alert })), { ssr: false }),
  Gallery: dynamic(() => import("@/components/Builder/CustomBlocks/Gallery"), { ssr: false }),
  MostPopular: dynamic(() => import("@/components/Builder/CustomBlocks/MostPopular"), { ssr: false }),
  ImageGrid: dynamic(() => import("./ui/editor/ImageGrid"), { ssr: false }),
  ThemeSwitcher: dynamic(() => import("@/components/Builder/CustomBlocks/ThemeSwitcher"), { ssr: false }),
  NavbarContainer: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarContainer"), { ssr: false }),
  LogoBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/LogoBlock"), { ssr: false }),
  NavigationBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/NavigationBlock"), { ssr: false }),
  ActionButtonBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/ActionButtonBlock"), { ssr: false }),
  HeroSection: dynamic(() => import("@/components/Builder/CustomBlocks/HeroSection"), { ssr: false }),
  FooterBlock: dynamic(() => import("@/components/Builder/CustomBlocks/FooterBlock"), { ssr: false }),
  SectionDivider: dynamic(() => import("@/components/Builder/CustomBlocks/SectionDivider"), { ssr: false }),
  ContactInfo: dynamic(() => import("@/components/Builder/CustomBlocks/ContactInfo"), { ssr: false }),
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
      <SortableContext items={node.children?.map((child) => child.id) ?? []} strategy={verticalListSortingStrategy}>
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

        {/*  {...(node.props.style === undefined && node.style ? { style: node.style } : {})} */}
        {/* This is for the style to be applied to the component (e.x Articles.tsx) */}
        <Component
          {...node.props}
          className={`${node.props.className || ""} ${node.className || ""}`}
          {...(node.props.style === undefined && node.style ? { style: node.style } : {})}
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
