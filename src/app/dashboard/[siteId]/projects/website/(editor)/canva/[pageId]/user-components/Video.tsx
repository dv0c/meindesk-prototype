"use client"

import React from "react"
import { useNode } from "@craftjs/core"
import { Video as VideoIcon } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import {
    PropertySection,
    PropertyRow,
    PropertyInput,
    PropertySelect,
    PropertySwitch
} from "../components/PropertySection"

export interface VideoProps {
    url?: string
    controls?: boolean
    autoplay?: boolean
    loop?: boolean
    ratio?: string
    style?: BlockStyle
    className?: string
}

const defaultStyles: BlockStyle = {
    width: "100%",
    height: "auto",
    display: "block",
}

const VideoSettings = () => {
    const {
        actions: { setProp },
        url,
        controls,
        autoplay,
        loop,
        ratio
    } = useNode((node) => ({
        url: node.data.props.url,
        controls: node.data.props.controls,
        autoplay: node.data.props.autoplay,
        loop: node.data.props.loop,
        ratio: node.data.props.ratio
    }))

    return (
        <div>
            <PropertySection title="Video Source">
                <PropertyRow label="URL">
                    <PropertyInput
                        value={url || ""}
                        onChange={(v) => setProp((props: VideoProps) => (props.url = v))}
                        placeholder="YouTube, Vimeo, or direct link"
                    />
                </PropertyRow>
                <PropertyRow label="Aspect Ratio">
                    <PropertySelect
                        value={ratio || "16/9"}
                        onChange={(v) => setProp((props: VideoProps) => (props.ratio = v))}
                        options={[
                            { label: "16:9", value: "16/9" },
                            { label: "4:3", value: "4/3" },
                            { label: "1:1", value: "1/1" },
                            { label: "21:9", value: "21/9" }
                        ]}
                    />
                </PropertyRow>
            </PropertySection>
            <PropertySection title="Behavior">
                <PropertyRow label="Controls">
                    <PropertySwitch
                        value={controls ?? true}
                        onChange={(v) => setProp((props: VideoProps) => (props.controls = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Autoplay">
                    <PropertySwitch
                        value={autoplay ?? false}
                        onChange={(v) => setProp((props: VideoProps) => (props.autoplay = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Loop">
                    <PropertySwitch
                        value={loop ?? false}
                        onChange={(v) => setProp((props: VideoProps) => (props.loop = v))}
                    />
                </PropertyRow>
            </PropertySection>
            <UniversalStyleTab />
        </div>
    )
}

export const Video = defineBlock<VideoProps>({
    name: "Video",
    category: "Interactive",
    icon: <VideoIcon className="w-4 h-4" />,
    description: "Embed video from URL",

    defaultProps: {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        controls: true,
        autoplay: false,
        loop: false,
        ratio: "16/9",
        style: defaultStyles
    },

    settings: VideoSettings,

    render: ({ url, controls, autoplay, loop, ratio, style, className, theme }) => {
        // Simple YouTube/Vimeo embed detection or use standard video tag for others
        // For prototype speed, we'll try a generic iframe approach or direct video

        // This is a simplified embed logic
        const getEmbedUrl = (inputUrl: string) => {
            if (!inputUrl) return ""
            // Basic YouTube transform
            if (inputUrl.includes("youtube.com") || inputUrl.includes("youtu.be")) {
                const videoId = inputUrl.split("v=")[1]?.split("&")[0] || inputUrl.split("/").pop()
                return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&loop=${loop ? 1 : 0}`
            }
            // Basic Vimeo
            if (inputUrl.includes("vimeo.com")) {
                const videoId = inputUrl.split("/").pop()
                return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}`
            }
            return inputUrl
        }

        const embedUrl = getEmbedUrl(url || "")
        const isIframe = embedUrl.includes("youtube") || embedUrl.includes("vimeo")

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...style,
                aspectRatio: ratio
            },
            className
        })

        return (
            <div className={computedClassName} style={computedStyle}>
                {isIframe ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen={true}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <video
                        src={url}
                        controls={controls}
                        autoPlay={autoplay}
                        loop={loop}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
        )
    },

    childrenAllowed: false
})
