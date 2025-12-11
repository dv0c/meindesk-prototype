"use client"

import { Phone, Mail, Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContactInfoProps {
    phone?: string
    email?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    showIcons?: boolean
    layout?: "horizontal" | "vertical" | "grid"
    iconSize?: "sm" | "md" | "lg"
    fontSize?: "sm" | "base" | "lg"
    textColor?: string
    spacing?: "sm" | "md" | "lg"
    className?: string
}

export default function ContactInfo({
    phone,
    email,
    facebook,
    instagram,
    linkedin,
    twitter,
    showIcons = true,
    layout = "vertical",
    iconSize = "md",
    fontSize = "base",
    textColor,
    spacing = "md",
    className = "",
}: ContactInfoProps) {
    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    }

    const fontSizes = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
    }

    const spacingClasses = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    }

    const layoutClasses = {
        horizontal: "flex-row flex-wrap",
        vertical: "flex-col",
        grid: "grid grid-cols-2 md:grid-cols-3",
    }

    const contactItems = []

    if (phone) {
        contactItems.push({
            icon: Phone,
            label: phone,
            href: `tel:${phone}`,
            type: "phone",
        })
    }

    if (email) {
        contactItems.push({
            icon: Mail,
            label: email,
            href: `mailto:${email}`,
            type: "email",
        })
    }

    const socialItems = []

    if (facebook) {
        socialItems.push({ icon: Facebook, href: facebook, label: "Facebook" })
    }

    if (instagram) {
        socialItems.push({ icon: Instagram, href: instagram, label: "Instagram" })
    }

    if (linkedin) {
        socialItems.push({ icon: Linkedin, href: linkedin, label: "LinkedIn" })
    }

    if (twitter) {
        socialItems.push({ icon: Twitter, href: twitter, label: "Twitter" })
    }

    return (
        <div
            className={cn("flex", layoutClasses[layout], spacingClasses[spacing], className)}
            style={{ color: textColor }}
        >
            {/* Contact Info */}
            {contactItems.map((item, index) => (
                <a
                    key={index}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-2 hover:opacity-70 transition-opacity",
                        fontSizes[fontSize]
                    )}
                >
                    {showIcons && <item.icon className={iconSizes[iconSize]} />}
                    <span>{item.label}</span>
                </a>
            ))}

            {/* Social Media */}
            {socialItems.map((item, index) => (
                <a
                    key={`social-${index}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity"
                    title={item.label}
                >
                    {showIcons ? (
                        <item.icon className={iconSizes[iconSize]} />
                    ) : (
                        <span className={fontSizes[fontSize]}>{item.label}</span>
                    )}
                </a>
            ))}
        </div>
    )
}
