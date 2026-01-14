"use client"

import React, { createContext, useContext } from "react"

export type DeviceMode = "desktop" | "tablet" | "mobile"

interface DeviceContextType {
    deviceMode: DeviceMode
}

const DeviceContext = createContext<DeviceContextType | null>(null)

export function DeviceProvider({
    children,
    deviceMode
}: {
    children: React.ReactNode
    deviceMode: DeviceMode
}) {
    return (
        <DeviceContext.Provider value={{ deviceMode }}>
            {children}
        </DeviceContext.Provider>
    )
}

export function useDevice() {
    const context = useContext(DeviceContext)
    // If no context (e.g. published site), return null to indicate "use native media queries"
    return context
}
