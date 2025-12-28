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

export const metadata = {
    title: "Editor | PROTOTYPE — Blog Builder & Drag-Drop CMS",
}

const layout: FC<layoutProps> = async ({ children, params }) => {
    const { siteId, id } = await params
    const session = await getAuthSession()
    const team = await getActiveTeam(siteId)

    if (!session?.user.id) redirect('/login')
    if (!team) redirect('/dashboard')

    return <div className='bg-neutral-950 h-screen overflow-auto pb-5'>
        {children}
    </div>
}

export default layout