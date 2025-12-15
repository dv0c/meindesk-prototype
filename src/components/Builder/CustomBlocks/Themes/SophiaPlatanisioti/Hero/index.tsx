import Image from "next/image";
import type { ReactNode } from "react";
import { useEditorContent } from "@/hooks/useEditorContent";
import "./styles.css";

interface HeroProps {
    // Content
    content?: string;
    thumbnail?: string;
    heading1?: string;
    heading2?: string;
    altText?: string;
    children?: ReactNode;

    // Layout & Spacing
    containerPadding?: string;
    maxWidth?: string;
    gap?: string;
    contentMarginTop?: string;
    imageMarginRight?: string;
    imageMarginBottom?: string;
    bottomPadding?: string;

    // Image Settings
    imageWidth?: number;
    imageHeight?: number;
    imageQuality?: number;
    imagePosition?: "left" | "right" | "top" | "bottom";
    imageObjectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";

    // Colors
    textColor?: string;
    headingColor?: string;
    backgroundColor?: string;
    dividerColor?: string;

    // Typography
    fontSize?: string;
    headingSize?: string;
    lineHeight?: string;

    // Layout
    layout?: "default" | "centered" | "wide";
    imageFloat?: "left" | "right" | "none";

    // Visibility
    showImage?: boolean;
    showDivider?: boolean;
    showHeadings?: boolean;

    // Responsive
    responsiveImageWidth?: string;
    mobileLayout?: "stack" | "default";
}

export const Hero = ({
    content = "",
    thumbnail = "",
    heading1 = "Είμαι στη διάθεσή σας για μια διαδικτυακή συνάντηση,",
    heading2 = "για να γνωριστούμε και να απαντήσω σε ό,τι σας απασχολεί.",
    altText = "Hero Image",
    children,

    // Layout & Spacing
    containerPadding = "px-3",
    maxWidth = "max-w-[52.5rem]",
    gap = "gap-10",
    contentMarginTop = "mt-20",
    imageMarginRight = "mr-8",
    imageMarginBottom = "mb-5",
    bottomPadding = "pb-20",

    // Image Settings
    imageWidth = 380,
    imageHeight = 460,
    imageQuality = 100,
    imagePosition = "left",
    imageObjectFit = "cover",

    // Colors
    textColor = "text-[#5a5933]",
    headingColor = "text-[#7f2e2d]",
    backgroundColor = "",
    dividerColor = "border-black/30",

    // Typography
    fontSize = "text-[18px]",
    headingSize = "text-[120%]",
    lineHeight = "leading-snug",

    // Layout
    layout = "default",
    imageFloat = "left",

    // Visibility
    showImage = true,
    showDivider = true,
    showHeadings = true,

    // Responsive
    responsiveImageWidth = "w-full sm:w-auto",
    mobileLayout = "stack",
}: HeroProps) => {
    // Extract HTML from structured editor data using hook
    const htmlContent = useEditorContent(content)

    // Apply layout-specific classes
    const layoutClasses = {
        default: "",
        centered: "items-center justify-center text-center",
        wide: "max-w-full"
    }

    // Determine image order based on position
    const imageOrder = imagePosition === "right" ? "order-2" : imagePosition === "bottom" ? "order-last" : ""
    const flexDirection = imagePosition === "top" || imagePosition === "bottom" ? "flex-col" : ""

    const containerClass = `${containerPadding} ${backgroundColor}`;
    const wrapperClass = `${layout === "wide" ? "max-w-full" : maxWidth} mx-auto ${layoutClasses[layout]}`;
    const contentClass = `${fontSize} space-y-5 ${textColor}`;
    const imageClass = `float-left ${imageMarginRight} ${imageMarginBottom} object-${imageObjectFit}`;

    return (
        <div className={containerClass}>
            <div className={wrapperClass}>
                <div className={contentClass}>
                    {/* Image floats left, text wraps around it */}
                    {showImage && thumbnail && (
                        <Image
                            width={imageWidth}
                            height={imageHeight}
                            quality={imageQuality}
                            className={imageClass}
                            alt={altText}
                            src={thumbnail}
                            priority
                        />
                    )}

                    {htmlContent && (
                        <div
                            className="prose-sm homepage prose-p:pt-0 prose-p:${lineHeight} max-w-full"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}

                    {showHeadings && (heading1 || heading2) && (
                        <div className="clear-both">
                            {showDivider && <hr className={`${dividerColor} mb-10`} />}
                            <div className={`text-center space-y-3 ${bottomPadding}`}>
                                {heading1 && (
                                    <h2 className={`${headingColor} ${headingSize}`}>
                                        {heading1}
                                    </h2>
                                )}
                                {heading2 && (
                                    <h2 className={`${headingColor} ${headingSize}`}>
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
    );
};