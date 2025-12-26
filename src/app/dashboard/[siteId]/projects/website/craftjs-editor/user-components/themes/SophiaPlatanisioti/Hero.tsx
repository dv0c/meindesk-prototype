import React from 'react'
import Image from "next/image"
import { withCraftComponent } from "../../../lib/withCraftComponent"
import { useEditorContent } from "@/hooks/useEditorContent"

interface HeroProps {
    content?: string
    thumbnail?: string
    containerPadding?: string
    containerMargin?: string
    heading1?: string
    heading2?: string
    children?: React.ReactNode
    className?: string
}

const HeroBase = ({
    content = "",
    thumbnail = "https://placehold.co/380x460", // Default placeholder
    containerPadding = "px-3",
    containerMargin = "0",
    heading1 = "Your Main Title Here",
    heading2 = "Subtitle or Role Here",
    children,
    className = "",
}: HeroProps) => {
    const htmlContent = useEditorContent(content)
    const altText = "Hero Image"
    const containerClass = `${containerPadding} ${containerMargin} ${className}`.trim()

    return (
        <div className={containerClass}>
            <div className="max-w-[52.5rem] mx-auto">
                <div className="text-[18px] space-y-5 text-[#5a5933]">
                    {/* Image floats left, text wraps around it */}
                    {thumbnail && (
                        <div className="float-left mr-8 mb-5 relative w-[380px] h-[460px]">
                            <Image
                                fill
                                sizes="(max-width: 768px) 100vw, 380px"
                                className="object-cover"
                                alt={altText}
                                src={thumbnail}
                                priority
                            />
                        </div>
                    )}

                    {htmlContent && (
                        <div
                            className="prose-sm homepage prose-p:pt-0 prose-p:leading-snug max-w-full"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}

                    {/* Fallback if no specific HTML content but we want to show something in editor */}
                    {!htmlContent && !children && (
                        <div className="prose-sm homepage prose-p:pt-0 prose-p:leading-snug max-w-full">
                            <p>ADD YOUR TEXT HERE...</p>
                        </div>
                    )}

                    {(heading1 || heading2) && (
                        <div className="clear-both">
                            <hr className="border-black/30 mb-10" />
                            <div className="text-center space-y-3 pb-20">
                                {heading1 && (
                                    <h2 className="text-[#7f2e2d] text-[120%] font-serif">
                                        {heading1}
                                    </h2>
                                )}
                                {heading2 && (
                                    <h2 className="text-[#7f2e2d] text-[120%] font-serif">
                                        {heading2}
                                    </h2>
                                )}
                            </div>
                        </div>
                    )}

                    {children && <div className="mt-8 clear-both">{children}</div>}
                </div>
            </div>
        </div>
    )
}

export const SophiaHero = withCraftComponent<HTMLDivElement, HeroProps>(
    HeroBase,
    {
        name: 'Sophia Hero',
        settingsConfig: {
            content: {
                type: 'textarea',
                label: 'Main Content (HTML)',
                rows: 10
            },
            thumbnail: {
                type: 'media',
                label: 'Portrait Image'
            },
            heading1: {
                type: 'text',
                label: 'Main Heading'
            },
            heading2: {
                type: 'text',
                label: 'Sub Heading'
            },
            containerPadding: {
                type: 'spacing',
                label: 'Padding'
            },
            containerMargin: {
                type: 'spacing',
                label: 'Margin'
            }
        }
    }
)
