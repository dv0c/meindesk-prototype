import type { ReactNode, CSSProperties } from "react"
import { cn } from "@/lib/utils"

// Define a generic type T for the items in the gallery
interface GalleryProps<T> {
  /** Optional class names to apply to the main gallery div. */
  className?: string
  /** The array of data items to display. */
  items: T[]
  /** A function that renders a single item from the 'items' array. */
  renderItem: (item: T, index: number) => ReactNode
  /** Optional inline styles for the main gallery div. */
  style?: CSSProperties
  /** Optional class names for the grid items themselves. */
  itemClassName?: string
  /** The minimum number of columns to display in the grid (default: 2). */
  minColumns?: number
  /** Any other props (useful for editor/design systems). */
  [key: string]: any
}

// Use a function declaration with an explicit type for generics
export default function Gallery<T>({
  className,
  items,
  renderItem,
  style,
  itemClassName,
  minColumns = 2,
  ...props
}: GalleryProps<T>) {
  const isEditorMode = props["data-editor-mode"]
  const nodeId = props["data-node-id"]

  // Calculate the CSS grid columns based on minColumns
  // Example: min-h-[400px] and grid-cols-2 for desktop, adapting for smaller screens
  const gridTemplateColumns = `repeat(auto-fit, minmax(min(100%, ${100 / minColumns}% / 2 + 100px), 1fr))`

  const hasItems = items && items.length > 0

  return (
    <div
      className={cn(
        // Base styling for the container, similar to your Container component
        "rounded-lg border bg-card p-4 sm:p-6 transition-all duration-200",
        // Styling when in editor mode and empty
        isEditorMode && !hasItems && "min-h-[120px] flex items-center justify-center",
        className,
      )}
      style={style}
      {...props}
    >
      {hasItems ? (
        <div
          // Apply grid styles for the gallery layout
          className="grid gap-4 sm:gap-6"
          style={{ gridTemplateColumns }}
        >
          {items.map((item, index) => (
            <div key={index} className={cn("overflow-hidden", itemClassName)}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ) : (
        // Display placeholder text if the gallery is empty
        <p className="text-sm text-muted-foreground text-center">
          {isEditorMode ? "Gallery is empty. Add items." : "No items to display"}
        </p>
      )}
    </div>
  )
}