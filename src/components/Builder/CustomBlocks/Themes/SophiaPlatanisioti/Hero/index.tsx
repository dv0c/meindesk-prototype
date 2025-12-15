import Image from "next/image";
import type { ReactNode } from "react";
import { useEditorContent } from "@/hooks/useEditorContent";
import "./styles.css";

interface HeroProps {
    // Editable Content
    content?: string;
    thumbnail?: string;
    children?: ReactNode;

    // Editable Spacing
    containerPadding?: string;
    containerMargin?: string;

    heading1?: string;
    heading2?: string;
}

export const Hero = ({
    content = "",
    thumbnail = "",
    children,
    containerPadding = "px-3",
    containerMargin = "0",
    heading1 = "",
    heading2 = "",
}: HeroProps) => {
    // Extract HTML from structured editor data using hook
    const htmlContent = useEditorContent(content)

    // Static values - not editable
    const altText = "Hero Image";

    // Combine container classes (both padding and margin are Tailwind classes)
    const containerClass = `${containerPadding} ${containerMargin}`;

    return (
        <div className={containerClass}>
            <div className="max-w-[52.5rem] mx-auto">
                <div className="text-[18px] space-y-5 text-[#5a5933]">
                    {/* Image floats left, text wraps around it */}
                    {thumbnail && (
                        <Image
                            width={380}
                            height={460}
                            quality={100}
                            className="float-left mr-8 mb-5 object-cover"
                            alt={altText}
                            src={thumbnail}
                            priority
                        />
                    )}

                    {htmlContent && (
                        <div
                            className="prose-sm homepage prose-p:pt-0 prose-p:leading-snug max-w-full"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}

                    {(heading1 || heading2) && (
                        <div className="clear-both">
                            <hr className="border-black/30 mb-10" />
                            <div className="text-center space-y-3 pb-20">
                                {heading1 && (
                                    <h2 className="text-[#7f2e2d] text-[120%]">
                                        {heading1}
                                    </h2>
                                )}
                                {heading2 && (
                                    <h2 className="text-[#7f2e2d] text-[120%]">
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