// Types for page layout rendering (used by tenant frontend)

export interface LayoutNode {
    id: string
    type: string
    props?: Record<string, any>
    children?: LayoutNode[]
    snippetId?: string
}

export interface WebsiteSettings {
    title: string
    description?: string
    theme?: {
        mode: 'light' | 'dark'
        primaryColor?: string
        secondaryColor?: string
        fontFamily?: string
        backgroundColor?: string
        textColor?: string
    }
    seo?: {
        title?: string
        description?: string
        ogImage?: string
        favicon?: string
    }
}

export interface PageData {
    id: string
    title: string
    slug: string
    layout: LayoutNode[]
    settings?: WebsiteSettings
    siteId?: string
    createdAt?: Date
    updatedAt?: Date
    meta?: Record<string, any>
}
