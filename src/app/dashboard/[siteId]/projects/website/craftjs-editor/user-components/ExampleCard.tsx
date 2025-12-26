/**
 * EXAMPLE: Card Component with AUTO-GENERATED Settings
 * 
 * This example shows how to create a CraftJS component with automatic settings
 * generation - NO manual settings code needed!
 */

import React from 'react'
import { withCraftComponent, CraftComponentProps, propsToStyle } from '../lib/withCraftComponent'

// 1. Define component-specific props
interface CardProps extends CraftComponentProps {
    title?: string
    content?: string
    imageUrl?: string
}

// 2. Create the base component
const CardBase = React.forwardRef<HTMLDivElement, CardProps>(
    ({ title, content, imageUrl, ...props }, ref) => {
        const style = propsToStyle(props)

        return (
            <div
                ref={ref}
                className={props.className}
                style={{
                    ...style,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid #e5e7eb',
                }}
            >
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                )}
                <div style={{ padding: '16px' }}>
                    {title && <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h3>}
                    {content && <p style={{ fontSize: '14px', color: '#6b7280' }}>{content}</p>}
                </div>
            </div>
        )
    }
)

CardBase.displayName = 'CardBase'

// 3. Wrap with CraftJS and AUTO-GENERATE settings!
export const Card = withCraftComponent(CardBase, {
    displayName: 'Card',
    defaultProps: {
        title: 'Card Title',
        content: 'Card description goes here...',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
    },
    // AUTO-GENERATE SETTINGS - No manual settings component needed!
    settingsConfig: {
        title: 'Title',
        content: { label: 'Description', type: 'textarea', rows: 3 },
        imageUrl: { label: 'Image', type: 'media' },
    },
    sectionTitle: 'Content'
})

// That's it! Settings are automatically generated.
// No need for manual CardSettings component! 🎉

