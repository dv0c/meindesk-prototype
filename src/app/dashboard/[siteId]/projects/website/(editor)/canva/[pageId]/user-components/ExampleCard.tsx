/**
 * EXAMPLE: Card Component with AUTO-GENERATED Settings using defineBlock
 */

import React from 'react'
import { defineBlock, useBlockStyles, BlockStyle } from '@/lib/block-api'

// 1. Define component-specific props
export interface CardProps {
    title?: string
    content?: string
    imageUrl?: string
    style?: BlockStyle
    className?: string
    // Legacy props for settings auto-gen (mapped to style)
    borderRadius?: number
    backgroundColor?: string
    paddingTop?: number | string
    paddingRight?: number | string
    paddingBottom?: number | string
    paddingLeft?: number | string
}

// 2. Wrap with defineBlock and AUTO-GENERATE settings!
export const Card = defineBlock<CardProps>({
    name: 'Card',
    category: 'Content',

    defaultProps: {
        title: 'Card Title',
        content: 'Card description goes here...',
        // Style defaults
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#e5e7eb',
            borderRadius: 8,
            backgroundColor: '#ffffff',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
        }
    },

    settingsConfig: {
        title: 'Title',
        content: { label: 'Description', type: 'textarea', rows: 3 },
        imageUrl: { label: 'Image', type: 'media' },
        // Settings for style props (mapped in render)
        borderRadius: 'Border Radius',
        backgroundColor: { label: 'Background', type: 'color' }
    },

    render: ({
        title,
        content,
        imageUrl,
        style,
        className,
        // Destructure mapped props to merge into style
        borderRadius,
        backgroundColor,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft
    }) => {
        // Merge root props into style object for useBlockStyles
        // This allows generateSettings to edit root props, which we then apply to styles
        const mergedStyle: BlockStyle = {
            ...style,
            borderRadius: borderRadius !== undefined ? borderRadius : style?.borderRadius,
            backgroundColor: backgroundColor !== undefined ? backgroundColor : style?.backgroundColor,
            paddingTop: paddingTop !== undefined ? paddingTop : style?.paddingTop,
            paddingRight: paddingRight !== undefined ? paddingRight : style?.paddingRight,
            paddingBottom: paddingBottom !== undefined ? paddingBottom : style?.paddingBottom,
            paddingLeft: paddingLeft !== undefined ? paddingLeft : style?.paddingLeft,
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: mergedStyle,
            className
        })

        return (
            <div
                className={computedClassName}
                style={computedStyle}
            >
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: Number(mergedStyle.borderRadius) > 0 ? `${Number(mergedStyle.borderRadius) - 1}px` : 0 }}
                    />
                )}
                <div style={{ padding: '16px' }}>
                    {title && <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h3>}
                    {content && <p style={{ fontSize: '14px', color: '#6b7280' }}>{content}</p>}
                </div>
            </div>
        )
    }
})

// That's it! Settings are automatically generated.
// No need for manual CardSettings component! 🎉

