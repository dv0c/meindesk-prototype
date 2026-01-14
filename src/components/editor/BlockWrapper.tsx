import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNode, useEditor } from '@craftjs/core'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface BlockWrapperProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({ children, className, style }) => {
    const {
        connectors: { connect, drag },
    } = useNode()

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }))

    // 1. Validate 'children' is a single element we can clone
    if (!React.isValidElement(children)) {
        return (
            <div
                ref={(ref: any) => connect(drag(ref))}
                className={className}
                style={style}
            >
                {children}
            </div>
        )
    }

    // 2. Clone the child and merge props
    const clonedChild = React.cloneElement(children as React.ReactElement<any>, {
        ref: (ref: any) => {
            if (ref) connect(drag(ref))
        },
        className: cn(
            (children.props as any).className,
            className
        ),
        style: {
            ...(children.props as any).style,
            ...style,
            cursor: enabled ? 'default' : undefined
        }
    })

    return clonedChild
}
