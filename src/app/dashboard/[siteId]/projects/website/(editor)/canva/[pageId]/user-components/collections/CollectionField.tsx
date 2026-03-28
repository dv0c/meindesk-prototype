"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { sanitizeRichHtml } from "@/lib/security/sanitize-html"
import { useCollectionField } from "./CollectionItemContext"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"

export interface CollectionFieldProps {
    fieldName?: string
    value?: any
    renderAs?: "text" | "heading" | "paragraph" | "image" | "badge" | "date" | "link"
    headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    dateFormat?: "short" | "long" | "relative"
    placeholder?: string
    linkHref?: string

    style?: BlockStyle
    className?: string
    responsive?: { hiddenOn?: string[] }
}

export const CollectionField = defineBlock<CollectionFieldProps>({
    name: "Collection Field",
    category: "Collections",
    icon: <div className="p-1">T</div>,

    defaultProps: {
        fieldName: "",
        renderAs: "text",
        headingLevel: "h2",
        dateFormat: "short",
        placeholder: "—",
        style: {},
    },

    settingsConfig: {
        // Data Section
        fieldName: {
            label: "Field Name",
            type: "collection-field-select",
            section: "Data",
            description: "Name of the field from the parent CollectionItem"
        },

        // Rendering Section
        renderAs: {
            label: "Render As",
            type: "select",
            section: "Rendering",
            options: [
                { label: "Text", value: "text" },
                { label: "Heading", value: "heading" },
                { label: "Paragraph", value: "paragraph" },
                { label: "Image", value: "image" },
                { label: "Badge", value: "badge" },
                { label: "Date", value: "date" },
                { label: "Link", value: "link" },
            ],
        },
        headingLevel: {
            label: "Heading Level",
            type: "select",
            section: "Rendering",
            options: [
                { label: "H1", value: "h1" },
                { label: "H2", value: "h2" },
                { label: "H3", value: "h3" },
                { label: "H4", value: "h4" },
            ],
        },
        dateFormat: {
            label: "Date Format",
            type: "select",
            section: "Rendering",
            options: [
                { label: "Short", value: "short" },
                { label: "Long", value: "long" },
                { label: "Relative", value: "relative" },
            ],
        },
        placeholder: {
            label: "Placeholder",
            type: "text",
            section: "Rendering",
        },
        linkHref: {
            label: "Link URL",
            type: "text",
            section: "Rendering",
            description: "Used only when Render As = Link"
        },
    },

    render: ({
        fieldName = "",
        value: staticValue,
        renderAs = "text",
        headingLevel = "h2",
        dateFormat = "short",
        placeholder = "—",
        linkHref = "",
        style,
        className,
        responsive,
        isEditing,
        deviceMode,
    }) => {
        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className,
            responsive,
            isEditing,
            deviceMode,
        })

        const contextField = useCollectionField(fieldName)

        // Use static value if provided, otherwise use context value
        const value = staticValue !== undefined ? staticValue : contextField.value
        const fieldType = contextField.fieldType

        // Handle empty/null values
        if (value === null || value === undefined || value === "") {
            if (!fieldName && !staticValue) {
                return (
                    <div className={cn("border-2 border-dashed border-border p-4 text-center", computedClassName)} style={computedStyle}>
                        <p className="text-muted-foreground font-mono text-xs uppercase">
                            Set "Field Name" in settings
                        </p>
                    </div>
                )
            }
            return (
                <span className={cn("text-muted-foreground", computedClassName)} style={computedStyle}>
                    {placeholder}
                </span>
            )
        }

        const renderValue = () => {
            // Image rendering
            if (fieldType === "image" || renderAs === "image") {
                return (
                    <img
                        src={value}
                        alt=""
                        className={cn("max-w-full h-auto", computedClassName)}
                        style={computedStyle}
                    />
                )
            }

            // Boolean rendering
            if (fieldType === "boolean") {
                return (
                    <span
                        className={cn(value ? "text-green-500" : "text-muted-foreground", computedClassName)}
                        style={computedStyle}
                    >
                        {value ? "Yes" : "No"}
                    </span>
                )
            }

            // Date rendering
            if (fieldType === "date" || renderAs === "date") {
                const date = new Date(value)
                let formatted = value

                if (!isNaN(date.getTime())) {
                    if (dateFormat === "short") {
                        formatted = date.toLocaleDateString()
                    } else if (dateFormat === "long") {
                        formatted = date.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                    } else if (dateFormat === "relative") {
                        const now = new Date()
                        const diffMs = now.getTime() - date.getTime()
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

                        if (diffDays === 0) formatted = "Today"
                        else if (diffDays === 1) formatted = "Yesterday"
                        else if (diffDays < 7) formatted = `${diffDays} days ago`
                        else if (diffDays < 30) formatted = `${Math.floor(diffDays / 7)} weeks ago`
                        else formatted = date.toLocaleDateString()
                    }
                }

                return <span className={computedClassName} style={computedStyle}>{formatted}</span>
            }

            // Rich text rendering
            if (fieldType === "richtext") {
                return (
                    <div
                        className={cn("prose prose-sm max-w-none", computedClassName)}
                        style={computedStyle}
                        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(String(value ?? "")) }}
                    />
                )
            }

            // Badge rendering
            if (renderAs === "badge") {
                const values = Array.isArray(value) ? value : [value]
                return (
                    <div className={cn("flex flex-wrap gap-2", computedClassName)} style={computedStyle}>
                        {values.map((v: any, i: number) => (
                            <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                                {String(v)}
                            </span>
                        ))}
                    </div>
                )
            }

            // Link rendering
            if (renderAs === "link" && linkHref) {
                return (
                    <a
                        href={linkHref}
                        className={cn("text-primary hover:underline", computedClassName)}
                        style={computedStyle}
                    >
                        {String(value)}
                    </a>
                )
            }

            // Heading rendering
            if (renderAs === "heading") {
                const HeadingTag = (headingLevel || "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
                return (
                    <HeadingTag className={computedClassName} style={computedStyle}>
                        {String(value)}
                    </HeadingTag>
                )
            }

            // Paragraph rendering
            if (renderAs === "paragraph") {
                return <p className={computedClassName} style={computedStyle}>{String(value)}</p>
            }

            // Handle arrays
            if (Array.isArray(value)) {
                return <span className={computedClassName} style={computedStyle}>{value.join(", ")}</span>
            }

            // Handle objects (resolved relations)
            if (typeof value === "object") {
                const displayValue = value.title || value.name || value.slug || JSON.stringify(value)
                return <span className={computedClassName} style={computedStyle}>{displayValue}</span>
            }

            // Default text rendering
            return <span className={computedClassName} style={computedStyle}>{String(value)}</span>
        }

        return renderValue()
    }
})

export default CollectionField
