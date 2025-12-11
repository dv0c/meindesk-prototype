"use client"

import type { LayoutNode } from "@/lib/types"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import dynamic from "next/dynamic"
import type React from "react"
import { Suspense } from "react"
import { DraggableWrapper } from "./editor/draggable-wrapper"
import { useBuilderStore } from "@/lib/store"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RenderNodeProps {
  node: LayoutNode
  isEditor?: boolean
  onSelect?: (id: string) => void
  isSelected?: boolean
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  validComponentNames?: string[]
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
  Navbar: dynamic(() => import("./ui/editor/Navbar"), { ssr: false }),
  Navbar2: dynamic(() => import("@/components/Builder/CustomBlocks/Navbar"), { ssr: false }),
  SophiaNavBar: dynamic(() => import("@/components/Builder/CustomBlocks/SophiaNavBar"), { ssr: false }),
  SingleArticle: dynamic(() => import("@/components/Builder/CustomBlocks/SingleArticle").then(m => ({ default: m.SingleArticle })), { ssr: false }),
  Textarea: dynamic(() => import("@/components/Builder/CustomBlocks/Textarea"), { ssr: false }),
  Select: dynamic(() => import("@/components/Builder/CustomBlocks/Select"), { ssr: false }),
  Slider: dynamic(() => import("@/components/Builder/CustomBlocks/Slider"), { ssr: false }),
  Skeleton: dynamic(() => import("@/components/Builder/CustomBlocks/Skeleton"), { ssr: false }),
  Spinner: dynamic(() => import("@/components/Builder/CustomBlocks/Spinner"), { ssr: false }),
  Table: dynamic(() => import("@/components/Builder/CustomBlocks/Table"), { ssr: false }),
  Breadcrumb: dynamic(() => import("@/components/Builder/CustomBlocks/Breadcrumb"), { ssr: false }),
  MostPopular: dynamic(() => import("@/components/Builder/CustomBlocks/MostPopular"), { ssr: false }),
  ImageGrid: dynamic(() => import("./ui/editor/ImageGrid"), { ssr: false }),
  ThemeSwitcher: dynamic(() => import("@/components/Builder/CustomBlocks/ThemeSwitcher"), { ssr: false }),
  NavbarContainer: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarContainer"), { ssr: false }),
  LogoBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/LogoBlock"), { ssr: false }),
  NavigationBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/NavigationBlock"), { ssr: false }),
  ActionButtonBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/ActionButtonBlock"), { ssr: false }),
  HeroSection: dynamic(() => import("@/components/Builder/CustomBlocks/HeroSection"), { ssr: false }),
  ContactInfo: dynamic(() => import("@/components/Builder/CustomBlocks/ContactInfo"), { ssr: false }),
}


export function RenderNode({ node, isEditor = false, onSelect, isSelected = false, onContextMenu, validComponentNames }: RenderNodeProps) {
  const Component = componentMap[node.type]

  const { removeNode } = useBuilderStore()

  // Check if component exists AND if it's in the allowed list (if list is provided - only in editor)
  const isAllowed = isEditor && validComponentNames ? validComponentNames.includes(node.type) : true
  // We treat it as missing if:
  // 1. It's not in our code map (Component is undefined)
  // 2. OR it is in code map but explicitly not allowed by API (isAllowed is false)
  const isMissing = !Component || !isAllowed

  if (isMissing) {
    if (isEditor) {
      return (
        <DraggableWrapper
          id={node.id}
          isSelected={isSelected}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          isContainer={false}
          data={{ type: "component", isContainer: false, component: node }}
        >
          <div className="p-6 border rounded-lg flex flex-col items-center justify-center gap-3 text-center min-h-[150px] shadow-sm">
            <div className="h-10 w-10  rounded-full bg-red-500/20 flex items-center justify-center ">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold ">Theme Component Missing</h4>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                The block <span className="font-mono underline font-semibold">{node.type}</span> is part of a theme that’s not currently installed.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8  border-[#CE7E5A] hover:bg-[#DDC57A]/30 hover:text-[#D34E4E] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                removeNode(node.id)
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Remove Block
            </Button>
          </div>

        </DraggableWrapper>
      )
    }

    // In preview/live mode, render nothing or a hidden element to avoid breaking layout
    return null
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
          validComponentNames={validComponentNames}
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
          validComponentNames={validComponentNames}
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
            validComponentNames={validComponentNames}
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
