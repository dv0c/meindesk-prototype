import { getActiveTeam } from '@/lib/actions/helpers/team'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React, { FC } from 'react'

interface layoutProps {
    children: React.ReactNode
    params: {
        siteId: string;
        id: string
    }
}

const layout: FC<layoutProps> = async ({ children, params }) => {
    const { siteId, id } = await params
    const session = await getAuthSession()
    const team = await getActiveTeam(siteId)

    if (!session?.user.id) redirect('/login')
    if (!team) redirect('/dashboard')

    return <div className='bg-neutral-950'>
        {children}
    </div>
}

export default layout