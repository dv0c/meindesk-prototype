import { Metadata } from 'next'
import React, { FC } from 'react'

interface layoutProps {
    children: React.ReactNode
}

export const metadata: Metadata = {
    title: "Dashboard | PROTOTYPE — Blog Builder & Drag-Drop CMS",
    description:
        "Build stunning blogs with our intuitive drag-and-drop CMS. RSS feed scraper, SEO builder, custom themes, and a generous free tier. Total control over your content.",
    generator: "Meindesk Prototype Builder",
    icons: {
        icon: [
            {
                url: "/PrototypeFav.png",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/PrototypeFav.png",
                media: "(prefers-color-scheme: dark)",
            },
            {
                url: "/PrototypeFav.svg",
                type: "image/svg+xml",
            },
        ],
        apple: "/PrototypeFav.png",
    },
}


const layout: FC<layoutProps> = ({ children }) => {
    return <main className=''>
        {children}
    </main>
}

export default layout