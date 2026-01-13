"use client"

import React, { useState } from "react"
import { useNode } from "@craftjs/core"
import { List } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    PropertySection,
    PropertyRow,
    PropertyInput,
} from "../components/PropertySection"

// Similar data-driven approach for Accordion
export interface AccordionItem {
    id: string
    title: string
    content: string
}

export interface AccordionProps {
    items?: AccordionItem[]
    style?: BlockStyle
    className?: string
}

const defaultStyles: BlockStyle = {
    width: "100%",
    backgroundColor: "transparent",
}

const AccordionSettings = () => {
    const {
        actions: { setProp },
        items
    } = useNode((node) => ({
        items: node.data.props.items
    }))

    const addItem = () => {
        setProp((props: AccordionProps) => {
            const newItems = props.items ? [...props.items] : []
            newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                title: `Item ${newItems.length + 1}`,
                content: "Accordion content details..."
            })
            props.items = newItems
        })
    }

    const updateItem = (index: number, field: keyof AccordionItem, value: string) => {
        setProp((props: AccordionProps) => {
            if (props.items && props.items[index]) {
                props.items[index][field] = value
            }
        })
    }

    const removeItem = (index: number) => {
        setProp((props: AccordionProps) => {
            if (props.items) {
                const newItems = [...props.items]
                newItems.splice(index, 1)
                props.items = newItems
            }
        })
    }

    return (
        <div>
            <PropertySection title="Accordion Items">
                <div className="flex flex-col gap-4">
                    {items?.map((item: AccordionItem, i: number) => (
                        <div key={item.id} className="border p-2 rounded relative">
                            <div className="absolute top-1 right-1 cursor-pointer text-red-500" onClick={() => removeItem(i)}>
                                ×
                            </div>
                            <PropertyRow label="Title">
                                <PropertyInput
                                    value={item.title}
                                    onChange={(v) => updateItem(i, 'title', v)}
                                />
                            </PropertyRow>
                            <PropertyRow label="Content">
                                <PropertyInput
                                    value={item.content}
                                    onChange={(v) => updateItem(i, 'content', v)}
                                />
                            </PropertyRow>
                        </div>
                    ))}
                    <Button onClick={addItem} size="sm" variant="outline">+ Add Item</Button>
                </div>
            </PropertySection>

        </div>
    )
}

export const Accordion = defineBlock<AccordionProps>({
    name: "Accordion",
    category: "Interactive",
    icon: <List className="w-4 h-4" />,
    description: "Collapsible content sections",

    defaultProps: {
        items: [
            { id: "1", title: "Question 1", content: "Answer to question 1." },
            { id: "2", title: "Question 2", content: "Answer to question 2." }
        ],
        style: defaultStyles
    },

    settings: AccordionSettings,

    render: ({ items, style, className, theme }) => {
        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        const [openItem, setOpenItem] = useState<string | null>(null)

        const toggle = (id: string) => {
            setOpenItem(openItem === id ? null : id)
        }

        return (
            <div className={computedClassName} style={computedStyle}>
                {items?.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 last:border-0">
                        <button
                            className="flex w-full items-center justify-between py-4 font-medium transition-all hover:underline"
                            onClick={() => toggle(item.id)}
                        >
                            {item.title}
                            <ChevronDown
                                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${openItem === item.id ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden text-sm transition-all duration-300 ease-in-out ${openItem === item.id ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            {item.content}
                        </div>
                    </div>
                ))}
            </div>
        )
    },

    childrenAllowed: false
})
