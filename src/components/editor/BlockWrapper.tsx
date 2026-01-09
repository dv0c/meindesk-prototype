import React, { useEffect, useRef } from 'react'
import { useNode, useEditor } from '@craftjs/core'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface BlockWrapperProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    // Add other props that might be passed down or needed for the wrapper
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({ children, className, style }) => {
    const {
        id,
        connectors: { connect, drag },
        selected,
        hovered,
        isHovered,
        actions: { setProp },
        dom,
        name
    } = useNode((node) => ({
        selected: node.events.selected,
        hovered: node.events.hovered,
        isHovered: node.events.hovered,
        dom: node.dom,
        name: node.data.displayName
    }))

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }))

    // Label for the selected/hovered block
    const Label = () => {
        if (!dom) return null

        // We use a portal or absolute positioning relative to the canvas 
        // For simplicity in this v1, let's keep it simple:
        // A tag that appears above the element

        return (
            <div
                className={cn(
                    "absolute -top-6 left-0 h-6 px-2 flex items-center bg-primary text-primary-foreground text-[10px] font-medium rounded-t-sm pointer-events-none z-50 whitespace-nowrap",
                    selected ? "opacity-100" : "opacity-0"
                )}
                style={{
                    backgroundColor: selected ? 'var(--primary, #3b82f6)' : 'transparent',
                }}
            >
                {name}
            </div>
        )
    }

    // Selection Ring / Hover Effect
    // Instead of wrapping 'children' in a div which might break flex/grid layouts, 
    // we attach the refs to the children if possible, or we assume this component IS the wrapper.
    // However, ensuring checking that 'connect' is applied is critical.

    // In our `defineBlock` strategy, the user's render function returns the root element.
    // The `BlockWrapper` might be used INSIDE that render function, OR `defineBlock` wraps the user's render in this.
    // If we wrap the user's render in a Div, it breaks layout.

    // Ideally, `defineBlock` should perform the `connect(drag(dom))` on the root user element.
    // But standardized selection visuals usually require an overlay or a wrapper.
    // A common pattern in Craft is that the user component *is* the DOM element.

    // For this implementation, let's assume `BlockWrapper` is used *inside* the user's component
    // to wrap their content, providing the common "Editor UI" features.

    // WAIT: `connect` must be on the specific DOM element that represents the node.
    // So this component should probably take a `render` prop or be a HOC?
    // Let's stick to the plan: "Wraps every block rendered in the editor".
    // If we use it as a wrapper inside the component:
    /*
      render: ({ props }) => (
        <BlockWrapper {...props}>
          <button>...</button>
        </BlockWrapper>
      )
    */
    // This creates a `div` around the button, which might break `display: flex` on the parent container.
    // A better approach for visual editors is to use an overlay system (like `@craftjs/layers` or a custom overlay).
    // Given the constraints and the "clean architecture" goal, let's make `BlockWrapper` a purely functional helper 
    // or ensure it passes styles through correctly.

    // Let's implement it as a Fragment-like wrapper that attaches refs if `asChild` is used, 
    // or just renders a div if not. But for safety in a builder, a `div` wrapper is safest 
    // IF we copy the layout styles (flex, grid behavior) to the wrapper.

    // Actually, looking at `defineBlock` implementation, we invoke `config.render`.
    // We can't easily wrap the result of `config.render` without parsing it.

    // Alternative: The `BlockWrapper` is an Overlay component that we render *alongside* the content?
    // Or we use it as the root element.

    // Let's try the "Style Injector" approach. 
    // We'll create a hook `useBlockVisuals` that returns props to spread onto the root element.

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            className={cn(
                "relative transition-all",
                className,
                enabled && hovered && !selected && "ring-1 ring-primary/50 ring-dashed",
                enabled && selected && "ring-2 ring-primary"
            )}
            style={{
                ...style,
                // Ensure the wrapper behaves like the component should in layout
                // This is tricky without knowing if it should be inline, block, flex, etc.
                // We rely on `style` prop passing the correct display/position.
                cursor: enabled ? 'default' : undefined
            }}
        >
            {enabled && selected && (
                <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-primary text-white text-[9px] rounded-t-sm font-medium z-[9999] pointer-events-none">
                    {name}
                </div>
            )}
            {children}

            {/* Empty state indicator could go here if we detect empty children */}
        </div>
    )
}
