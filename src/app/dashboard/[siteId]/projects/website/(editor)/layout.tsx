import React, { FC } from 'react'

interface layoutProps {
    children: React.ReactNode
}

export const metadata = {
    title: "Builder | PROTOTYPE — Blog Builder & Drag-Drop CMS",
}

const layout: FC<layoutProps> = ({ children }) => {
    return <main>
        {children}
    </main>
}

export default layout