import Image from "next/image";
import type { ReactNode } from "react";

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
    const containerClass = `${containerPadding} ${backgroundColor}`;
    const wrapperClass = `flex ${maxWidth} mx-auto ${gap} ${mobileLayout === "stack" ? "flex-col md:flex-row" : ""
        }`;
    const contentClass = `${fontSize} ${contentMarginTop} space-y-5 ${textColor}`;
    const imageClass = `object-${imageObjectFit} ${responsiveImageWidth} ${imageFloat !== "none" ? `float-${imageFloat}` : ""
        } ${imageMarginRight} ${imageMarginBottom}`;

    return (
        <div className={containerClass}>
            <div className={wrapperClass}>
                <div className={contentClass}>
                    {showImage && thumbnail && (
                        <div className="w-auto h-auto">
                            <Image
                                width={imageWidth}
                                height={imageHeight}
                                quality={imageQuality}
                                className={imageClass}
                                alt={altText}
                                src={thumbnail}
                                priority
                            />
                        </div>
                    )}

                    {content && (
                        <div
                            className={`${fontSize} homepage prose-sm prose-p:pt-0 prose-p:${lineHeight} mr-auto mx-auto max-w-full mt-20 ${textColor}`}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    )}

                    {showHeadings && (heading1 || heading2) && (
                        <div>
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

                    {children && <div className="mt-8">{children}</div>}
                </div>
            </div>
        </div>
    );
};