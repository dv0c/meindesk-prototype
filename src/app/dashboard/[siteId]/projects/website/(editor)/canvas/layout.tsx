import React, { FC } from 'react'

interface layoutProps {
    children: React.ReactNode
}

const layout: FC<layoutProps> = ({ children }) => {
    return <div>
        {children}
    </div>
}

export default layout