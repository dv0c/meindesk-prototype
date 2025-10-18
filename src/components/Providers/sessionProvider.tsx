'use client'
import React, { FC } from 'react'
import { SessionProvider as S } from "next-auth/react"

interface layoutProps {
    children: React.ReactNode
}

const SessionProvider: FC<layoutProps> = ({ children }) => {
    return <S>
        {children}
    </S>
}

export default SessionProvider