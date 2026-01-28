
import { getAuthSession } from "@/lib/auth"
import { requireAuth, requireSiteAccess } from "@/lib/security/route-auth"
import ChatLayout from "@/components/dashboard/chat/ChatLayout"
import { getChannels } from "@/lib/actions/channel-actions"

interface PageProps {
    params: {
        siteId: string
    }
}

export default async function ChatPage({ params }: PageProps) {
    const session = await requireAuth()
    const { siteId } = await params

    // Verify access
    await requireSiteAccess(siteId, session.user.id)

    // Fetch channels
    const channels = await getChannels(siteId)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 h-full">
            <ChatLayout
                siteId={siteId}
                currentUserId={session.user.id}
                channels={channels}
            />
        </div>
    )
}
