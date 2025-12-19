import { notFound, redirect } from "next/navigation"
import { getActiveTeam } from "@/lib/actions/helpers/team"
import { getAuthSession } from "@/lib/auth"
import { SnippetsProvider } from "./canva/[pageId]/components/editor/snippets-context"

interface EditorLayoutProps {
    children: React.ReactNode
    params: { siteId: string }
}

/**
 * Validates that a string is a valid MongoDB ObjectID.
 * ObjectIDs must be 24-character hexadecimal strings.
 */
function isValidObjectId(id: string): boolean {
    if (!id || typeof id !== 'string') return false
    return /^[a-fA-F0-9]{24}$/.test(id)
}

/**
 * Server-side layout for the editor routes.
 * Validates that the siteId exists and belongs to the logged-in user.
 * Returns 404 for invalid or non-existent site IDs.
 */
export default async function EditorLayout({ children, params }: EditorLayoutProps) {
    const { siteId } = await params

    // Validate siteId format (must be valid MongoDB ObjectID)
    if (!isValidObjectId(siteId)) {
        notFound()
    }

    // Validate user is logged in
    const session = await getAuthSession()
    if (!session?.user?.id) {
        redirect("/login")
    }

    // Validate siteId exists and belongs to user
    const site = await getActiveTeam(siteId)
    if (!site) {
        notFound()
    }

    return (
        <SnippetsProvider siteId={siteId}>
            <div className="h-screen overflow-hidden">
                {children}
            </div>
        </SnippetsProvider>
    )
}
