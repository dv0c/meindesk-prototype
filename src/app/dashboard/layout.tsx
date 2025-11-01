import React, { FC } from 'react'

interface layoutProps {
    children: React.ReactNode
}

const layout: FC<layoutProps> = ({ children }) => {
    return <main className=''>
        {children}
    </main>
}

export default layout