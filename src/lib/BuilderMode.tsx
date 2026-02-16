"use client"
import { usePathname } from "next/navigation"

/**
 * Constants for mode types
 */
export const BUILDER_MODE = {
  EDITOR: "editor",
  PREVIEW: "preview",
} as const

export type BuilderMode = (typeof BUILDER_MODE)[keyof typeof BUILDER_MODE]

/**
 * Hook to get the current builder mode
 * Returns "editor" if in the editor page (contains `/canva/`),
 * otherwise returns "preview".
 */
export function useBuilderMode(): BuilderMode {
  const pathname = usePathname()

  return pathname.includes("/canva/") || pathname.includes("/builder/")
    ? BUILDER_MODE.EDITOR
    : BUILDER_MODE.PREVIEW
}

/**
 * Hook to check if currently in editor mode
 */
export function useIsEditorMode(): boolean {
  return useBuilderMode() === BUILDER_MODE.EDITOR
}

/**
 * Hook to check if currently in preview mode
 */
export function useIsPreviewMode(): boolean {
  return useBuilderMode() === BUILDER_MODE.PREVIEW
}

/**
 * Utility function to check if editor mode based on pathname.
 * Use this in non-component contexts (like API routes or utilities).
 */
export function isEditorModeFromPath(pathname: string): boolean {
  return pathname.includes("/canva/") || pathname.includes("/builder/")
}

/**
 * Utility function to check if preview mode based on pathname.
 * Basically anything that isn’t the editor.
 */
export function isPreviewModeFromPath(pathname: string): boolean {
  return !pathname.includes("/canva/") && !pathname.includes("/builder/")
}
