'use client'
import React from "react";
import { CraftComponentProps, propsToStyle, withCraftComponent, EditableText } from "../../../lib/withCraftComponent";
import { cn } from "@/lib/utils";

interface FooterProps extends CraftComponentProps {
    heading?: string
    phone?: string
    email?: string
    facebook?: string
    showCreatedBy?: boolean
}

const FooterBase = React.forwardRef<HTMLDivElement, FooterProps>(({
    heading = "Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
    phone = "+30 6947777532",
    email = "platanisiotisophia@gmail.com",
    facebook = "https://www.facebook.com/PlatanisiotiSophia",
    showCreatedBy = true,
    ...props
}, ref) => {
    const style = propsToStyle(props)

    return (
        <div ref={ref} style={style} className={cn("w-full", props.className)}>
            {/* Main Footer Section */}
            <div className="bg-[#ccc0a8] truncate px-3 space-y-5 text-center py-10 text-[100%] font-normal text-[#5a5933]">
                <EditableText propName="heading" value={heading || ""} as="h1" />
                {phone && (
                    <h2 className="font-light text-xl">
                        <a href={`tel:${phone}`}>
                            <EditableText propName="phone" value={phone} as="span" />
                        </a>
                    </h2>
                )}
                {email && (
                    <EditableText propName="email" value={email} as="h2" className="font-light" />
                )}
                {facebook && (
                    <h2 className="overflow-hidden w-auto truncate">
                        Facebook:{" "}
                        <a
                            href={facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            {facebook}
                        </a>
                    </h2>
                )}
            </div>

            {/* Created By Section */}
            {showCreatedBy && (
                <div className="py-2 text-center text-xs truncate text-white bg-[#6d6a3d]">
                    <h1>
                        Created and maintained by
                        <a
                            href="https://github.com/dv0c"
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1 underline"
                        >
                            Meindesk.
                        </a>
                    </h1>
                </div>
            )}
        </div>
    )
})

FooterBase.displayName = "Footer"

export const Footer = withCraftComponent(FooterBase, {
    displayName: "Footer",
    defaultProps: {
        heading: "Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
        phone: "+30 6947777532",
        email: "platanisiotisophia@gmail.com",
        facebook: "https://www.facebook.com/PlatanisiotiSophia",
        showCreatedBy: true,
    },
    settingsConfig: {
        heading: {
            label: "Heading",
            type: "text",
        },
        phone: {
            label: "Phone",
            type: "text",
        },
        email: {
            label: "Email",
            type: "text",
        },
        facebook: {
            label: "Facebook URL",
            type: "text",
        },
        showCreatedBy: {
            label: "Show 'Created By' Section",
            type: "checkbox",
        },
    },
    sectionTitle: 'Footer Settings'
})