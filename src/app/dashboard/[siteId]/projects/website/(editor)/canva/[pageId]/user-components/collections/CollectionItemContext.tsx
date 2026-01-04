"use client"

import React, { createContext, useContext, ReactNode } from 'react'

/**
 * Context for passing collection item data to child components
 * 
 * This allows CollectionField components to automatically access their
 * parent CollectionItem's data without prop drilling.
 */

interface CollectionField {
    name: string
    type: string
    label: string
    required?: boolean
}

interface CollectionItemContextValue {
    /** The current item's data record */
    data: Record<string, any>
    /** The item's slug */
    slug: string
    /** The item's ID */
    id: string
    /** Collection field definitions */
    fields: CollectionField[]
    /** Whether data is still loading */
    loading: boolean
}

const CollectionItemContext = createContext<CollectionItemContextValue | null>(null)

/**
 * Provider component for wrapping CollectionItem content
 */
export function CollectionItemProvider({
    children,
    value
}: {
    children: ReactNode
    value: CollectionItemContextValue
}) {
    return (
        <CollectionItemContext.Provider value={value}>
            {children}
        </CollectionItemContext.Provider>
    )
}

/**
 * Hook to access the current collection item's data
 * Returns null if not inside a CollectionItemProvider
 */
export function useCollectionItem() {
    return useContext(CollectionItemContext)
}

/**
 * Hook to get a specific field's value and metadata
 */
export function useCollectionField(fieldName: string) {
    const context = useContext(CollectionItemContext)

    if (!context) {
        return {
            value: null,
            fieldType: undefined,
            label: fieldName,
            hasContext: false
        }
    }

    const field = context.fields.find(f => f.name === fieldName)
    const value = context.data?.[fieldName]

    return {
        value,
        fieldType: field?.type,
        label: field?.label || fieldName,
        hasContext: true
    }
}

export { CollectionItemContext }
export type { CollectionItemContextValue, CollectionField as CollectionFieldType }
