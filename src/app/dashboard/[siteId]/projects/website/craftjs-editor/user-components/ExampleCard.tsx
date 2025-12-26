/**
 * EXAMPLE: How to create a CraftJS component using the wrapper system
 * 
 * This example shows how to create a simple Card component with minimal code
 * by leveraging the wrapper system for common functionality.
 */

import React from 'react'
import { useNode } from '@craftjs/core'
import { withCraftComponent, CraftComponentProps, propsToStyle } from '../lib/withCraftComponent'
import { CommonSettings, SettingsSection, SettingControl } from '../lib/CommonSettings'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// 1. Define component-specific props (extends common props)
interface CardProps extends CraftComponentProps {
    title?: string
    content?: string
    imageUrl?: string
}

// 2. Create the base component (no CraftJS logic needed!)
const CardBase = React.forwardRef<HTMLDivElement, CardProps>(
    ({ title, content, imageUrl, ...props }, ref) => {
        // propsToStyle converts common props to inline styles
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

// 3. Wrap with CraftJS logic using HOC
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
    }
})

// 4. Create Settings component (use common settings + custom ones)
const CardSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as CardProps
    }))

    return (
        <div className="space-y-4 p-4">
            {/* Custom card-specific settings */}
            <SettingsSection title="Content">
                <SettingControl label="Title">
                    <Input
                        value={props.title || ''}
                        onChange={(e) => setProp((p: CardProps) => p.title = e.target.value)}
                        placeholder="Enter title"
                        className="h-8 text-xs"
                    />
                </SettingControl>

                <SettingControl label="Description">
                    <Textarea
                        value={props.content || ''}
                        onChange={(e) => setProp((p: CardProps) => p.content = e.target.value)}
                        placeholder="Enter description"
                        className="text-xs min-h-[60px]"
                    />
                </SettingControl>

                <SettingControl label="Image URL">
                    <Input
                        value={props.imageUrl || ''}
                        onChange={(e) => setProp((p: CardProps) => p.imageUrl = e.target.value)}
                        placeholder="https://..."
                        className="h-8 text-xs"
                    />
                </SettingControl>
            </SettingsSection>

            {/* Common settings (spacing, sizing, appearance) */}
            <CommonSettings />
        </div>
    )
}

// 5. Attach settings and craft config
Card.craft = {
    displayName: 'Card',
    props: {
        title: 'Card Title',
        content: 'Card description goes here...',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    related: {
        settings: CardSettings,
    },
    custom: {
        resizable: true,
        deletable: true,
    }
}
