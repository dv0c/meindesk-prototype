// This file exists solely to force Tailwind CSS to generate these classes
// which are used dynamically in src/lib/block-api.tsx but might not be scanned correctly
// if src/lib is not in the content configuration.

import React from 'react'

export function SafelistClasses() {
    return (
        <div className="hidden">
            {/* Mobile Visibility */}
            <div className="max-md:hidden" />
            <div className="max-md:opacity-25" />
            <div className="max-md:outline-dashed" />
            <div className="max-md:outline-1" />
            <div className="max-md:outline-rose-400" />

            {/* Tablet Visibility */}
            <div className="md:max-lg:hidden" />
            <div className="md:max-lg:opacity-25" />
            <div className="md:max-lg:outline-dashed" />
            <div className="md:max-lg:outline-1" />
            <div className="md:max-lg:outline-rose-400" />

            {/* Desktop Visibility */}
            <div className="lg:hidden" />
            <div className="lg:opacity-25" />
            <div className="lg:outline-dashed" />
            <div className="lg:outline-1" />
            <div className="lg:outline-rose-400" />
        </div>
    )
}
