"use client"

import React from "react"
import { useNode } from "@craftjs/core"
import {
    Layout,
    Maximize,
    Minimize,
    AlignHorizontalJustifyCenter,
    ArrowLeftRight,
    Box
} from "lucide-react"

export const SectionSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props
    }))

    const setPreset = (preset: 'full' | 'centered' | 'fixed') => {
        setProp((prop: any) => {
            if (!prop.style) prop.style = {};

            // Reset common layout properties
            prop.style.marginLeft = '0px';
            prop.style.marginRight = '0px';
            prop.style.maxWidth = 'none';
            prop.style.width = '100%';

            switch (preset) {
                case 'full':
                    prop.previewLayout = 'full';
                    prop.style.width = '100%';
                    prop.style.maxWidth = '100%';
                    break;
                case 'centered':
                    prop.previewLayout = 'centered';
                    prop.style.width = '100%';
                    prop.style.maxWidth = '1280px'; // standard max-width-7xl roughly
                    prop.style.marginLeft = 'auto';
                    prop.style.marginRight = 'auto';
                    break;
                case 'fixed':
                    prop.previewLayout = 'fixed';
                    prop.style.width = '1280px';
                    prop.style.maxWidth = '100%';
                    prop.style.marginLeft = 'auto';
                    prop.style.marginRight = 'auto';
                    break;
            }
        })
    }

    const currentLayout = props.previewLayout || 'full';

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase">Input Layout</span>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setPreset('full')}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs transition-all ${currentLayout === 'full'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                            }`}
                        title="Full Width"
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                        <span>Full</span>
                    </button>
                    <button
                        onClick={() => setPreset('centered')}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs transition-all ${currentLayout === 'centered'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                            }`}
                        title="Centered (Max Width)"
                    >
                        <AlignHorizontalJustifyCenter className="w-4 h-4" />
                        <span>Centered</span>
                    </button>
                    <button
                        onClick={() => setPreset('fixed')}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs transition-all ${currentLayout === 'fixed'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                            }`}
                        title="Fixed Width"
                    >
                        <Box className="w-4 h-4" />
                        <span>Fixed</span>
                    </button>
                </div>
            </div>

            <div className="h-px bg-gray-200 my-2" />

            {/* Visual Guide Hint */}
            <div className="bg-blue-50 text-blue-700 p-3 rounded text-xs border border-blue-100 flex gap-2">
                <Layout className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                    {currentLayout === 'full' && "Section spans the entire viewport width."}
                    {currentLayout === 'centered' && "Content is centered with a max-width limit."}
                    {currentLayout === 'fixed' && "Section has a fixed width and is centered."}
                </div>
            </div>
        </div>
    )
}
