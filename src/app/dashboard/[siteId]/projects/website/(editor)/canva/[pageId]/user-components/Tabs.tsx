"use client"

import React, { useState } from "react"
import { useNode } from "@craftjs/core"
import { CreditCard } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import { cn } from "@/lib/utils"
// Use existing UI components if available, otherwise build simple ones
import { Button } from "@/components/ui/button"

import {
    PropertySection,
    PropertyRow,
    PropertyInput,
} from "../components/PropertySection"

// Simple Tabs implementation for now.
// Ideally, the content of each tab would be a DropZone, but managing dynamic Elements in settings is complex.
// We will start with a data-driven approach where content is just text for this iteration, 
// OR we allow just one content area that switches (but that's hard to edit in canvas).
// Given "Props: items: array of { title, content }", we stick to data-driven text content for simplicity,
// or we can try to make it advanced later. Let's start with text content.

export interface TabItem {
    id: string
    title: string
    content: string
}

export interface TabsProps {
    items?: TabItem[]
    defaultValue?: string
    style?: BlockStyle
    className?: string
}

const defaultStyles: BlockStyle = {
    width: "100%",
    minHeight: 100,
    backgroundColor: "transparent",
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
}

const TabsSettings = () => {
    const {
        actions: { setProp },
        items
    } = useNode((node) => ({
        items: node.data.props.items
    }))

    const addTab = () => {
        setProp((props: TabsProps) => {
            const newItems = props.items ? [...props.items] : []
            newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                title: `Tab ${newItems.length + 1}`,
                content: "Tab content goes here..."
            })
            props.items = newItems
        })
    }

    const updateTab = (index: number, field: keyof TabItem, value: string) => {
        setProp((props: TabsProps) => {
            if (props.items && props.items[index]) {
                props.items[index][field] = value
            }
        })
    }

    const removeTab = (index: number) => {
        setProp((props: TabsProps) => {
            if (props.items) {
                const newItems = [...props.items]
                newItems.splice(index, 1)
                props.items = newItems
            }
        })
    }

    return (
        <div>
            <PropertySection title="Tabs">
                <div className="flex flex-col gap-4">
                    {items?.map((item: TabItem, i: number) => (
                        <div key={item.id} className="border p-2 rounded relative">
                            <div className="absolute top-1 right-1 cursor-pointer text-red-500" onClick={() => removeTab(i)}>
                                ×
                            </div>
                            <PropertyRow label="Title">
                                <PropertyInput
                                    value={item.title}
                                    onChange={(v) => updateTab(i, 'title', v)}
                                />
                            </PropertyRow>
                            <PropertyRow label="Content">
                                <PropertyInput
                                    value={item.content}
                                    onChange={(v) => updateTab(i, 'content', v)}
                                />
                            </PropertyRow>
                        </div>
                    ))}
                    <Button onClick={addTab} size="sm" variant="outline">+ Add Tab</Button>
                </div>
            </PropertySection>
            <UniversalStyleTab />
        </div>
    )
}

export const Tabs = defineBlock<TabsProps>({
    name: "Tabs",
    category: "Interactive",
    icon: <CreditCard className="w-4 h-4" />, // Placeholder icon
    description: "Tabbed content container",

    defaultProps: {
        items: [
            { id: "1", title: "Tab 1", content: "Content for tab 1." },
            { id: "2", title: "Tab 2", content: "Content for tab 2." }
        ],
        style: defaultStyles
    },

    settings: TabsSettings,

    render: ({ items, style, className, theme }) => {
        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        const [activeTab, setActiveTab] = useState(items?.[0]?.id)

        // Ensure active tab exists
        if (items && items.length > 0 && !items.find(i => i.id === activeTab)) {
            setActiveTab(items[0].id)
        }

        return (
            <div className={computedClassName} style={computedStyle}>
                <div className="flex border-b border-gray-200">
                    {items?.map((item) => (
                        <button
                            key={item.id}
                            className={cn(
                                "px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                activeTab === item.id
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-muted-foreground border-b-2 border-transparent hover:border-gray-300"
                            )}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
                <div className="p-4">
                    {items?.map((item) => (
                        <div key={item.id} className={activeTab === item.id ? "block" : "hidden"}>
                            {item.content}
                        </div>
                    ))}
                </div>
            </div>
        )
    },

    childrenAllowed: false
})
