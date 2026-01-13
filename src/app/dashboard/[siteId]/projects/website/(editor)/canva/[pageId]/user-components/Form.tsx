"use client"

import React from "react"
import { useNode } from "@craftjs/core"
import { FileInput } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
    PropertySection,
    PropertyRow,
    PropertyInput,
    PropertySelect,
    PropertySwitch
} from "../components/PropertySection"

// Types
export interface FormField {
    id: string
    type: 'text' | 'email' | 'password' | 'textarea' | 'checkbox' | 'radio'
    label: string
    name: string
    placeholder?: string
    required?: boolean
}

export interface FormProps {
    fields?: FormField[]
    submitLabel?: string
    layout?: 'stacked' | 'inline'
    action?: string // e.g., API endpoint
    style?: BlockStyle
    className?: string
}

const defaultStyles: BlockStyle = {
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: "100%",
}

const FormSettings = () => {
    const {
        actions: { setProp },
        submitLabel,
        layout,
        fields
    } = useNode((node) => ({
        submitLabel: node.data.props.submitLabel,
        layout: node.data.props.layout,
        fields: node.data.props.fields
    }))

    // In a real implementation this would be a draggable list or more complex editor
    // For now, we'll offer JSON editing or simple fixed field additions
    // To keep it simple for the task, let's just allow editing submit label and layout
    // and maybe add a "Add Field" button that adds a placeholder field

    const addField = () => {
        setProp((props: FormProps) => {
            const newFields = props.fields ? [...props.fields] : []
            newFields.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'text',
                label: 'New Field',
                name: 'field_' + newFields.length,
                required: false
            })
            props.fields = newFields
        })
    }

    return (
        <div>
            <PropertySection title="Form Configuration">
                <PropertyRow label="Submit Button Label">
                    <PropertyInput
                        value={submitLabel || "Submit"}
                        onChange={(v) => setProp((props: FormProps) => (props.submitLabel = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Layout">
                    <PropertySelect
                        value={layout || "stacked"}
                        onChange={(v) => setProp((props: FormProps) => (props.layout = v as any))}
                        options={[
                            { label: "Stacked", value: "stacked" },
                            { label: "Inline", value: "inline" }
                        ]}
                    />
                </PropertyRow>
                <div className="pt-2">
                    <Button onClick={addField} size="sm" variant="outline" className="w-full">
                        + Add Field
                    </Button>
                </div>
                {/* Field list editor would go here */}
            </PropertySection>
            <UniversalStyleTab />
        </div>
    )
}

export const Form = defineBlock<FormProps>({
    name: "Form",
    category: "Interactive",
    icon: <FileInput className="w-4 h-4" />,
    description: "Draggable form builder",

    defaultProps: {
        fields: [
            { id: "1", type: "text", label: "Name", name: "name", placeholder: "Your name", required: true },
            { id: "2", type: "email", label: "Email", name: "email", placeholder: "you@example.com", required: true },
            { id: "3", type: "textarea", label: "Message", name: "message", placeholder: "Your message...", required: false }
        ],
        submitLabel: "Send Message",
        layout: "stacked",
        style: defaultStyles
    },

    settings: FormSettings,

    render: ({ fields, submitLabel, layout, style, className, theme }) => {
        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        return (
            <form className={computedClassName} style={computedStyle} onSubmit={(e) => e.preventDefault()}>
                <div className={`flex ${layout === 'inline' ? 'flex-row flex-wrap items-end gap-4' : 'flex-col gap-4'}`}>
                    {fields?.map((field) => (
                        <div key={field.id} className={`${layout === 'inline' ? 'flex-1 min-w-[200px]' : 'w-full'}`}>
                            {field.type !== 'checkbox' && (
                                <Label htmlFor={field.id} className="mb-2 block text-sm font-medium">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </Label>
                            )}

                            {field.type === 'textarea' ? (
                                <Textarea
                                    id={field.id}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                />
                            ) : field.type === 'checkbox' ? (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id={field.id} name={field.name} required={field.required} />
                                    <Label htmlFor={field.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {field.label}
                                    </Label>
                                </div>
                            ) : (
                                <Input
                                    id={field.id}
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                />
                            )}
                        </div>
                    ))}
                    <div className={`${layout === 'inline' ? '' : 'pt-2'}`}>
                        <Button type="submit" className="w-full">
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            </form>
        )
    },

    childrenAllowed: false
})
